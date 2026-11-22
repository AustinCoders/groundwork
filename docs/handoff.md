# Handoff

Read this and the memory index first in a new session. Update it at the end of every big task, in five lines or fewer per section, then clear the chat.

## State (2026-10-16)

- `main` = `origin/main` = `8d7cd7b`: the DSA course is live (48 written chapters, a question pool for each, 934 exercises). Branches `feature/dsa-rebuild` and `feature/platform-topics` are kept.
- Planned work: the BMad planning folder and skills were removed; the open entries (28 DSA, 1 groundwork) now live in `docs/ROADMAP.md`, and the old text is in git history up to commit `2da0b19`.
- Uncommitted: the content standard (`AGENTS.md`, `docs/content-standard.md`, `docs/handoff.md`), `tests/chapter-standards*.ts`, `npm run claims:sync`. `npm run check` passes (78 files, 1630 tests).

## System Design batch 1 (2026-10-17)

- Four chapters added on `feature/system-design-batch-1`: replication, transactions and isolation, storage engines, time/ordering/IDs. The section is 28 chapters; chapter numbers were re-sequenced in reading order.
- Each chapter was fact-checked by an independent reviewer and every finding fixed; the audit file lists the counts. The claims sync was run, and the search index is 99.3 KB gzip of its 140 KB budget.
- Still missing: batch and stream processing, release safety, microservices and security basics, Xu walkthroughs, a practice layer (see `docs/content-audit/system-design.md`).

## System Design batch 2 (2026-10-17)

- Five chapters added on `feature/system-design-batch-2`: batch and stream processing, and walkthroughs for a key-value store, notifications, a web crawler and payments. The section is 33 chapters; the search index is 118.2 KB gzip of its 140 KB budget.
- Each chapter was fact-checked by an independent reviewer and every finding fixed; the audit file lists the counts. Numbers are guarded in `tests/system-design-quality.test.ts`.
- Still missing: release safety, microservices and security basics, the other Xu walkthroughs (proximity, metrics, ad clicks as its own walkthrough, wallet, leaderboard, stock exchange), a practice layer.

## System Design practice layer (2026-10-18)

- All 33 chapters have a pool of 7 or 8 questions in `content/system-design/quiz/` (258 in all), registered in `lib/designPool.ts` and shown as a practice card (no progress, no saved state); System Design stays `completion: "read"` because `"quiz"` would route it through the DSA placement flow and its single `groundwork:dsa:placement` key.
- Every pool was written from the chapter and its sources, reviewed blind by an independent agent (about 160 findings, all re-verified), and the rewritten questions had a second review round. Numeric answers are recomputed in `tests/design-estimates/`.
- Still open: design-prompt drills per walkthrough chapter and a whiteboard link (`/whiteboard` has no parameters), recorded in `docs/ROADMAP.md`; persistent practice scores (practice mode saves nothing).

## System Design design drills (2026-10-18)

- The six walkthroughs have a design drill (prompt, checklist, mistakes, self-scoring, nothing saved) in `content/system-design/drills/`, shown after the practice card, with a `/whiteboard?template=<chapter id>` starter board (`lib/whiteboard/drillBoards.ts`). Branch `feature/system-design-drills`, not merged.
- Each drill went through an author and three blind review rounds; chapter errors found on the way are listed in the audit file (batch 4) and are not fixed: payments "even a 500", crawler robots 5xx, URL shortener "a few TB".
- Still open: a drill for each walkthrough yet to be written; `sysdes-case-studies` has none by decision.

## Next

1. Commit and push the content standard (on a `feature/` branch, or on `feature/dsa-rebuild` if the owner says so).
2. Owner checks the Vercel production DSA pages (home, level check, two new chapters, search, phone) and reports anything odd.
3. Content review follow-ups, in order: confirm the exponent and `&amp;` findings in a browser (likely text-reading artifacts), SEO and indexing, written answers for the 613 interview follow-ups (R3, R4, R5, R8 first), then the topic-by-topic climb to the standard.
4. Automation still missing: a `new:chapter` command for the six-place wiring.

## Commands

- `npm run check`, `npm run build`, `npm run test:e2e` (build first); `npm run claims:sync` after content changes.
- Node 24: prefix with `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH`.

## Open questions for the owner

Who the learner is, languages beyond JavaScript, one release or level by level, placement in v1, the player rule, LeetCode names; marking stories 3.9 and 3.7 done; sharding the DSA search index by level.

## Company questions section (2026-10-19)

- Shipped to main: hub, per-question pages, 30 design answers with diagrams, 36 coding answers. Phase 1 of the company pages (22 company pages with process timelines, 10 Indian startups, 38 design and 52 coding answers, problems and playground sync) is on `feature/company-pages-phase1`, committed locally and not merged or pushed unless the owner said so.
- PHASE 2 (machine coding and LLD, CS and SQL sets, people rounds, model answers, thin companies) is on `feature/company-pages-phase2`; PHASE 3 (whiteboard boards from the answer diagrams, walkthrough mode, coding trace boards) is on `feature/company-whiteboard`, cut from the Phase 2 tip, uncommitted until the owner asks. See the last section of `docs/ROADMAP.md`. Decisions: keep the Interview book (link, share data); never add a company option to the mock interview.
- Detail pages were redesigned too: gradient hero with an at-a-glance card and company link, diagram tabs, a step-through dry run for coding answers, sticky command-bar filters on the hub.
- Data: `content/system-design/company-questions/` (process-main.ts, process-startups.ts, rounds.ts, batch1-8, dsa-batch1-9, diagrams/d1-d8). UI: `app/company-questions/`.
- Open: other themes unchecked (dark and Paper only), a yearly refresh of the evidence labels.

## Company questions: Phase 3 whiteboard (2026-10-20)

- Buttons on design, LLD and coding answer pages open `/whiteboard?from=<kind>/<id>`; the board JSON comes from a static route handler `/company-boards/<kind>/<id>` (`lib/companyBoards.ts`), converters are `lib/whiteboard/diagramBoard.ts` and `traceBoard.ts`, the walk model is `lib/whiteboard/walk.ts`.
- 64 design and LLD answers convert (141 diagrams); 15 of 66 coding traces qualify (array, search range, one list, four trees), the rest are skipped on purpose.
- Edited by hand for `tests/claims.test.ts`: CSS modules 83, `use client` files 157, Board.tsx chart 1,993 lines (`content/architecture/arch-*.ts`).
- Open: save the walk with the board, more trace shapes, small text on phones. Detail in `docs/ROADMAP.md`.

## Merges, accounts and CI (2026-11-22)

- `main` now has `feature/chapter-sources` (committed, with its client-bundle, claims and spelling fixes) and six Dependabot branches (CodeMirror, Next 16.4.6, React 19.3.1, Sentry 11.7, checkout v7.0.1, setup-node v7.1.0), each checked with `npm run check`, a build and the 29 e2e tests. Held: the dev-tooling PR (TypeScript 7 drops the compiler API the playground imports); the older CodeMirror PR is superseded. `feature/roadmap-building` is a kept WIP and was not merged.
- `feature/p0-accounts-sync`: optional Supabase accounts (project `groundwork`, ref `wlyfdbfqwwqvfbfxmeay`, `ap-south-1`, migration applied), sync engine in `lib/account/`, sign-in dialog, `/account`, `/auth/callback`, gates on `/progress`, `/review`, the mock readiness board and the saved-boards list; site copy and architecture chapters updated; `.github/workflows/check.yml`; README without "Handwritten".
- Owner to do before launch: Vercel variables, Supabase redirect URLs, custom SMTP, Google and GitHub OAuth apps; checklist in `docs/accounts.md`. Live sign-in was not exercised from the agent sandbox (Supabase is not reachable from it); RLS was checked against the migration in PGlite.
- Not started, recorded at the top of `docs/ROADMAP.md`: the 15 React chapters to the standard, and JS and React self-checks. Do each as its own session.

## React P0 chapters, batch 1 (2026-11-22)

- `react-usestate`, `react-lists-keys`, `react-useeffect-basics` rewritten to the standard on `feature/p0-accounts-sync` (4,044 / 3,561 / 3,545 words by the chapter-standards count). Every behaviour claimed (update queue, batching, bail-out, Strict Mode double calls, index-key bug, reorder DOM moves, effect and cleanup order, the fetch race) was run against React 19.3.1 in jsdom first.
- Their exercises now have three hints each; two new tests (two independent counters, a re-render with the same title).
- Self-checks for these chapters wait for the JS and React check work (ROADMAP P0 table).

## React P0 chapters, batches 2 to 5 (2026-11-22)

- The other 12 interview chapters are rewritten to the standard on `feature/p0-accounts-sync`: `react-useref`, `react-context`, `react-usereducer`, `react-custom-hooks`, `react-effects-depth`, `react-memoisation`, `react-fiber`, `react-concurrent`, `react-suspense`, `react-server-components`, `react-sync-external-store`, `react-performance` (3,502 to 3,531 words each). Each gained `prerequisites`.
- Behaviour quoted was run against React 19.3.1 in jsdom first, including: hooks share logic not state, the `useLocalStorage` changing-key overwrite, `useEffectEvent` and its render-time error, derived-state and effect-chain render counts, memo outcomes for five prop shapes, immutable list toggles rendering one row, begin and completion order, which changes keep state, transition and deferred render pairs, async action pending states, the suspend and transition sequence for one boundary, the uncached promise loop, and `useSyncExternalStore` loops, resubscription and hydration. The 19.3 transition change was checked against the release notes.
- Exercises: every exercise on the 15 chapters now has three hints and at least six tests. `ex-react-would-bail-out`'s solution now treats a renamed undefined prop as a change, with a test.
- The React search index budget is 160 KB (`tests/search-index.test.ts`).

## Sign-in dialog, second version (2026-11-22)

- `components/account/AuthDialog.tsx` is now email-first: the email comes first, then a password (returning), name and password (new), or a 6-digit code. Sign-in and sign-up switch without losing the email, and the code can be resent after 60 seconds. On wide screens it has a left panel listing what an account adds; under 760 px it is one column.
- `components/account/PasswordField.tsx` (also used for the new password after a reset link) has an eye toggle, a Caps Lock notice, a four-step strength meter from `lib/account/strength.ts` that marks down common passwords, runs and the person's own name or email, and ticked rules. Common passwords are refused on sign-up and reset.
- A confirmation email can be resent (`resendSignupEmail` in `lib/account/session.ts`).
- After the first sign-in, `AuthHost` opens a short "Make it yours" step (goal, experience, target role) when the profile has none of the three. Saving or skipping records `gw-onboarded:<user id>` in this browser, so it asks once per device.
- Tests: `tests/account-auth.test.ts`.
