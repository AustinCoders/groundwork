---
title: 'CI runs the comments check, with locked-down workflows'
type: 'bugfix'
ticket: '6'
created: '2026-10-01'
status: 'built'
route: 'oneshot'
route_source: 'auto'
review: 'quick'
review_source: 'auto'
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/planning-artifacts/audit-2026-09-28/code-quality.md']
warnings: []
deferred: []
baseline_revision: '97a1fefc33b8bb760544d85d7ddb047242453e58'
---

<intent-contract>

## Intent

**Problem:** `npm run comments` only runs locally via the pre-push hook, and `--no-verify` skips it, so a comment can reach `main` through CI. Neither workflow declares `permissions`, so each job gets the default (broad) `GITHUB_TOKEN` scope. Neither has a `concurrency` group, so overlapping pushes or PR updates run redundant jobs in parallel. Every third-party action is pinned to a moving major-version tag (`@v4`, `@v12`), which a compromised upstream could silently repoint.

**Approach:** Add a `comments` step to `ci.yml` in the same order `npm run check` runs it. Give both workflows a `contents: read` baseline and a `concurrency` group. Pin every third-party action to the full commit SHA it already resolves to, with a trailing version comment, so Dependabot's existing `github-actions` schedule can keep it current by PR. Update the two chapters that describe CI.

## Boundaries & Constraints

**Always:**
- `ci.yml`'s `comments` step runs after `Lint` and before `Formatting`, matching `npm run check`'s order (`typecheck && lint && comments && format:check && spell && test`).
- Every `actions/*` and `treosh/lighthouse-ci-action` reference in both workflow files becomes `@<full 40-char SHA>` with a trailing `# v<version>` comment, pinned to the commit each currently-used major tag resolves to today (not a different major version — that is a separate upgrade decision). YAML files are outside `npm run comments`'s scope (it only scans `.ts/.tsx/.js/.jsx/.mjs/.cjs/.css`), so this comment is allowed.
- Both workflow files get a top-level `permissions: contents: read` (neither job writes to the repo, comments on a PR, or calls anything needing more).
- `ci.yml` gets `concurrency: { group: "${{ github.workflow }}-${{ github.ref }}", cancel-in-progress: true }` (a new push to the same PR or branch cancels the stale run). `vercel-cleanup.yml` gets `concurrency: { group: "${{ github.workflow }}", cancel-in-progress: false }` (a scheduled or manual run waits rather than overlapping a deletion in progress).
- `content/architecture/arch-repo-map.ts`'s CI description names the comments check in its list. `content/architecture/arch-health.ts` drops the "CI does not run the comment check" row from "Known and accepted" (section 5), since it is now fixed rather than accepted.
- No comments added to any `.ts/.tsx/.js/.jsx/.mjs/.cjs/.css` file. `tests/claims.test.ts` passes unchanged (no case asserts the removed row's text).

**Never:**
- Do not bump any action to a newer major version; only pin what is already referenced.
- Do not touch `.lighthouserc.json`'s budgets or any other CI behaviour beyond permissions, concurrency, the pin and the new step.
- Do not add the `comments` step anywhere but `ci.yml`'s existing `check` job.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| A PR adds a comment to a `.ts` file | CI runs on that PR | The `comments` step fails the job, the same as the local pre-push hook would | The CI log shows the file and line, matching `scripts/comments.mjs`'s own output |
| A clean PR | CI runs | The `comments` step passes; every other step runs unchanged | No error expected |
| Both workflow files | Read as YAML | `permissions` and `concurrency` are present; every third-party `uses:` is a full SHA with a version comment | A missing or short SHA is a review defect, not a runtime one |
| Two pushes to the same PR, seconds apart | `ci.yml` concurrency | The first run is cancelled; the second completes | No error expected |

</intent-contract>

## Code Map

- `.github/workflows/ci.yml`: add a top-level `permissions:` and `concurrency:` block after the `on:` block. Insert a `- name: Comments` / `run: npm run comments` step between the existing `Lint` and `Formatting` steps. Replace `actions/checkout@v4` → `@11d5960a326750d5838078e36cf38b85af677262 # v4.4.0`; `actions/setup-node@v4` → `@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4.4.0`; both `actions/upload-artifact@v4` occurrences → `@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4.6.2`; `treosh/lighthouse-ci-action@v12` → `@3e7e23fb74242897f95c0ba9cabad3d0227b9b18 # v12.6.2`. These are the commits each tag resolves to today (confirmed via `gh api repos/<owner>/<repo>/tags`).
- `.github/workflows/vercel-cleanup.yml`: same `permissions:` and a `concurrency:` block (see Boundaries for the exact group/cancel values). Pin its `actions/checkout@v4` and `actions/setup-node@v4` to the same two SHAs above.
- `.github/dependabot.yml` already has a `github-actions` ecosystem entry (`directory: /`, monthly) — no change needed; it already watches both workflow files and will open PRs that bump the pinned SHA and its comment together, which is Dependabot's documented behaviour for this ecosystem.
- `content/architecture/arch-repo-map.ts:30`: `"CI runs typecheck, lint, formatting, spelling and Vitest, then a build, Playwright and Lighthouse"` → insert `comments` after `lint`.
- `content/architecture/arch-health.ts:161` (inside the "5. Known and accepted" table, `<tbody>` starting around line 159): delete the `<tr><td>CI does not run the comment check</td>...</tr>` row entirely.

## Tasks & Acceptance

**Execution:**
- [ ] `.github/workflows/ci.yml` -- the comments step, permissions, concurrency, pinned actions -- CI
- [ ] `.github/workflows/vercel-cleanup.yml` -- permissions, concurrency, pinned actions -- CI
- [ ] `content/architecture/arch-repo-map.ts`, `arch-health.ts` -- truthful CI description; the fixed row removed -- truth

**Acceptance Criteria:**
- Given both workflow files, when read, then every third-party action is pinned by full SHA with a version comment, and each declares `permissions` and `concurrency`.
- Given a pull request that adds a comment to a source file, when CI runs, then the `comments` step fails it.
- Given `npm run check`, when it runs, then it passes unchanged.

## Implementation Notes

## Plan Change Log

## Review Triage Log

### 2026-10-01 — Review pass
- verdicts: 1 finding — high 0, medium 0, low 1, false 0, maybe-false 0
- findings:
  - `[low]` `[patch]` `content/architecture/arch-roadmap.ts` still listed "Comment check in CI" as a pending "Next, each under a day" item (in both the SVG diagram and the ordered list), which this story's own change makes false — the plan's Code Map named only `arch-repo-map.ts` and `arch-health.ts`, missing this third chapter. Removed the item from the SVG's box, its `aria-label` and the ordered list, reflowing the remaining four items to close the gap. No test asserted the removed text, so nothing else needed to change.

## Design Notes

SHA-pinning only the already-referenced major version, rather than also upgrading to the newest major, keeps this a security/hygiene fix with no behaviour change to verify beyond "the job still runs the same steps." Dependabot's `github-actions` ecosystem (already configured, monthly) is what the ticket means by "keeping them current": once pinned, it opens a PR for each new release the same way it already does for npm packages, updating both the SHA and its trailing comment.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.

## Auto Run Result

**Summary:** `ci.yml` now runs `npm run comments` between Lint and Formatting, matching `npm run check`'s own order. Both workflow files declare `permissions: contents: read` and a `concurrency` group, and every third-party action (`actions/checkout`, `actions/setup-node`, `actions/upload-artifact`, `treosh/lighthouse-ci-action`) is pinned to the full commit SHA its current major-version tag resolves to, with a trailing version comment Dependabot's existing `github-actions` schedule can read and update.

**Files changed:**
- `.github/workflows/ci.yml`: the `Comments` step; `permissions`; `concurrency`; four pinned `uses:` lines.
- `.github/workflows/vercel-cleanup.yml`: `permissions`; `concurrency`; two pinned `uses:` lines.
- `AGENTS.md`: the now-false "CI does not run `npm run comments`" line corrected.
- `content/architecture/arch-repo-map.ts`: the CI description names the comments check.
- `content/architecture/arch-health.ts`: the "CI does not run the comment check" row removed from "Known and accepted".
- `content/architecture/arch-roadmap.ts`: "Comment check in CI" removed from the pending-work diagram and list (review finding).

**Review findings:** 1 finding (low), patched: a third chapter (`arch-roadmap.ts`) also described this exact gap as unshipped and was missing from the plan's Code Map.

**Verification:** `npm run check` passes (19 files, 320 unit tests, unchanged — this story adds no test cases). Both workflow YAML files parse correctly and every pinned SHA was confirmed against `gh api repos/<owner>/<repo>/tags` to be a full 40-character hash matching the stated version comment.

**Residual risks:**
- Not built or run in a real GitHub Actions environment in this session; the `Comments` step's placement and the YAML structure were verified by parsing and by matching `npm run check`'s own local behaviour, not by an actual CI run. The first real PR will be the first live confirmation.
- The ticket's `unknown` (whether Dependabot's `github-actions` updates work cleanly with SHA-pinned actions) is resolved by design, not tested here: Dependabot's documented behaviour for this ecosystem is to update both the SHA and its trailing comment together, and the existing `github-actions` schedule entry needs no change to pick up the now-pinned references.
