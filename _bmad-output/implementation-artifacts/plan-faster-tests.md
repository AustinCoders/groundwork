---
title: 'Faster tests: a fast tier and a full tier, a theme and font sample for local runs, duplicate cleanup, and a sharded CI'
type: 'feature'
ticket: ''
created: '2026-10-13'
status: 'built'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md']
warnings: []
deferred: []
baseline_revision: '5ae5845'
---

<intent-contract>

## Intent

**Problem:** The e2e suite grew from 9 to 15 to 17 minutes locally (631 tests on the DSA branch, 567 on main) and takes about 35 minutes on GitHub (ubuntu, 2 workers). Every UI round runs the whole suite several times (the agent, the coordinator's check, then CI). The owner wants tests to be faster and wants to avoid re-running what has not been affected.

**Approach (the safety net must NOT get weaker):**
1. **Two tiers.**
   - `npm run test:e2e:fast`: runs the unit tests plus only the e2e specs that the change can affect. A small, tested selector script (for example `scripts/e2e-select.mjs`) reads the changed files (`git diff` against the merge-base with `origin/main`, plus uncommitted changes) and maps paths to specs (for example `app/review/**` to `review.spec.ts` and the review states of `a11y.spec.ts`, `app/mock/**` to `mock.spec.ts`, `components/tour/**` to `tour.spec.ts`, `app/interview/**` to `book.spec.ts`, `components/practice/**` and `app/problems/**` to `workbench.spec.ts`, chapter and reader code to `chapters.spec.ts`). A change to ANY shared file falls back to the full suite: `app/globals.css`, `app/layout.tsx`, `components/ui/**`, `components/topic/**`, `components/chapter/**`, `components/frame/**`, `components/home/**`, `components/menu/**`, `components/SiteDrawer*`, `lib/**`, `content/**`, `e2e/**` helpers, `playwright.config.ts`, `package.json`, `next.config.ts`. When in doubt it chooses full. It prints what it selected and why. Unit tests for the selector cover a table of paths.
   - `npm run test:e2e` stays the FULL suite (every spec, and every theme and font when `CI` is set or `THEMES=all`).
2. **Theme and font sample for local runs.** The tests that loop over the nine themes and eight fonts (a11y states, compose probe, chapters, hero measures, fonts clipping) read their lists from one place (`e2e/themes.ts` or a new helper). Add `E2E_MATRIX=sample|all`: `all` is the default when `process.env.CI` is set; locally the default is `sample`: themes light, dark, lavender and blueprint, fonts classic, roboto, chalk and reading. `npm run test:e2e:full` forces `all`. Token-level contrast is already covered by unit tests in all nine themes, so the sample loses little. Never reduce what CI runs.
3. **Duplicate audit and cleanup.** Find e2e assertions that are repeated across specs (the hero-measure and balance checks appear in smoke, compose and per-area specs; overflow and fallback-font checks too) and remove only a clearly redundant copy, keeping the one in the most natural place. Report each removal with the reason. Do not delete a test that guards a distinct behaviour. Keep `tests/claims.test.ts` happy: it counts `test(` lines per spec, so update the architecture chapters' asserted numbers in `content/architecture/*` when counts change.
4. **Sharded CI.** Rework `.github/workflows/ci.yml` so the wall-clock time falls from about 35 minutes to about 12 to 15: static checks (typecheck, lint, comments, format, spell, unit tests) in one job running in parallel with the build; one build job whose output is shared with the e2e jobs (upload and download the `.next` build as an artifact, or rebuild per shard if the artifact is not smaller than the rebuild time, and report the numbers); the e2e suite split with Playwright `--shard=i/N` (N=3 or 4, decide by measured balance with `npx playwright test --list` and timing data) as a matrix; a final aggregator job named exactly `check` that depends on all of them and fails if any fails (the repository may require the status check named `check`, so that name must keep working); `retries` stays 1 on CI; keep `fail-fast: false` on the shard matrix; keep Lighthouse and the artifact uploads working (merge or upload per-shard reports); keep pinned action SHAs as they are; concurrency cancelling stays as it is. The e2e in CI MUST still run the full suite with `E2E_MATRIX=all`.
5. **Docs.** Update the "Running and verifying" section of `AGENTS.md` (the groundwork part, not the block written by `next dev`) with the two tiers, the matrix switch and the rule: the fast tier is for intermediate rounds, the full tier before merging to main; and the "How this is built" testing chapter (`content/architecture/arch-testing.ts`) with the new scripts and the CI layout, keeping the asserted numbers true.

## Boundaries & Constraints

**Always:**
- Measure before and after and report: local full suite time (3 workers) before vs after the sample, local fast tier time for three example changes (a review-page change, a tour change, a shared CSS change that must fall back to full), CI job layout. The goal is local intermediate rounds at 3 to 5 minutes and CI at about 12 to 15 minutes.
- The full tier must still pass entirely (zero failed, zero flaky) in a clean scratch copy with `CI=1`, and the fast tier must pass for the example changes.
- You cannot run GitHub Actions locally: validate the workflow by careful review, a YAML syntax check (use `actionlint` via `npx` or `docker run rhysd/actionlint` if available, else a Node YAML parse), a dry listing of the shards (`npx playwright test --shard=1/3 --list` and so on, showing the test counts per shard and that together they equal the full count), and by running one shard's command locally with `CI=1`. State clearly in the report that the live run of the new workflow is not yet verified, and list exactly what to look at in the first CI run.
- Keep every existing test's behaviour on CI; do not weaken assertions; do not skip tests; do not change application code.

**Never:** comments in source (`npm run comments` fails them); editing `.claude/skills/` or `_bmad/`; touching port 3000 or any broad `pkill`; the whiteboard (`app/whiteboard/**`, `lib/whiteboard*`, `app/mock/Whiteboard.tsx`); application code under `app/`, `components/`, `lib/` except test helpers that live in `e2e/`; committing, pushing or staging (the coordinator does that); creating pull requests.

## Code Map

- `playwright.config.ts`, `e2e/*.spec.ts`, `e2e/themes.ts` and the other e2e helpers (`composeProbe.ts`, `textProbe.ts`, `motionProbe.ts`, `failToLoad.ts`)
- `package.json` scripts, a new `scripts/e2e-select.mjs` (or similar) and its unit test in `tests/`
- `.github/workflows/ci.yml` (and read `vercel-cleanup.yml` only to avoid breaking it)
- `AGENTS.md`, `content/architecture/arch-testing.ts`, `arch-health.ts`, `tests/claims.test.ts`

## Tasks & Acceptance

- Given a change under `app/review/` only, then `npm run test:e2e:fast` selects the review specs and unit tests, runs in about 3 to 5 minutes and passes; given a change to `app/globals.css`, then it selects the full suite and says why.
- Given `E2E_MATRIX` unset locally, then the theme and font loops use the sample; given `CI=1` or `E2E_MATRIX=all`, then they use all nine themes and eight fonts, and the full tier passes with `CI=1` in a clean scratch copy with zero failed and zero flaky.
- Given the new workflow, then it passes the syntax check, the shards partition the full suite exactly (counts add up), the aggregator job is named `check`, and the report lists what to verify in the first live run.
- Given `npm run check`, `npm run build` and the full tier in a clean scratch copy, then all pass; architecture numbers asserted by `tests/claims.test.ts` are correct.

## Implementation Notes

(agent: log measurements, the selector's path map, the duplicate audit and the workflow layout here, newest last)

## Verification

**Commands (clean scratch copy under the scratchpad):** `npm run build`, `npm run check`, `CI=1 npx playwright test --workers=3 --retries=0` (full tier), then the fast tier examples.

## Auto Run Result

Scope replaced by the owner during the work. The original plan (a fast tier, a theme and font sample, a duplicate audit and a sharded CI) was dropped; the owner decided to remove the GitHub CI workflow entirely and to cut testing down to basic testing. What was built instead: `.github/workflows/ci.yml` deleted (`vercel-cleanup.yml` and `dependabot.yml` kept); the e2e suite cut from 567 tests in 12 specs to one `e2e/smoke.spec.ts` of 15 tests (8 page loads and 7 flows) that runs in about 8 seconds; 11 specs, 5 helpers and 2 fixtures deleted; the unit tests kept (984 after, 998 before; the 14 removed were claims about the axe spec and the old per-spec counts), including the claims, contrast, theme-roles and theme-contract tests; `AGENTS.md`, `README.md` and the architecture chapters (testing, health, design system, delivery, performance, repo map, tech stack and others) rewritten so "How this is built" stays true after the cut; `test:perf` and `.lighthouserc.json` left as they were. Independent check in a clean copy: `npm run check` 984 unit tests in 48 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`), `npm run build` passes (1,799 pages; one run failed on a transient Google-font fetch and passed on the retry), `npm run test:e2e` 15 of 15 on three runs, about 8 seconds each. What the owner no longer has a guard for: browser accessibility (axe), layout and overflow across sizes, the nine-theme and eight-font matrix in a browser, hydration-flash checks, the chapter crawl, any Linux run, and Lighthouse unless run by hand; the remaining guards are the unit tests (with the claims and contrast tests), typecheck, lint, comments, format, spelling, the production build, the 15 smoke tests, and Vercel's own preview build.
