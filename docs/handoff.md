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

- `/company-questions` hub, `/company-questions/design/<id>` (30, with 63 diagrams) and `/company-questions/coding/<id>` (36, with dry run and runnable code). Data in `content/system-design/company-questions/`, UI in `app/company-questions/`, notes at the end of `docs/content-audit/system-design.md`.
- Branch `feature/company-questions-diagrams-dsa`: committed locally, not merged or pushed unless the owner said so. Checked in dark and Paper themes, desktop and 375px; other themes unchecked.
- Open: evidence labels need a yearly refresh; design drills for these prompts; run each coding solution in the playground (only a copy button for now).
