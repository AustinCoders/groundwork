# Handoff

Read this and the memory index first in a new session. Update it at the end of every big task, in five lines or fewer per section, then clear the chat.

## State (2026-10-16)

- `main` = `origin/main` = `8d7cd7b`: the DSA course is live (48 written chapters, a question pool for each, 934 exercises). Branches `feature/dsa-rebuild` and `feature/platform-topics` are kept.
- Planned work: the BMad planning folder and skills were removed; the open entries (28 DSA, 1 groundwork) now live in `docs/ROADMAP.md`, and the old text is in git history up to commit `2da0b19`.
- Uncommitted: the content standard (`AGENTS.md`, `docs/content-standard.md`, `docs/handoff.md`), `tests/chapter-standards*.ts`, `npm run claims:sync`. `npm run check` passes (78 files, 1630 tests).

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
