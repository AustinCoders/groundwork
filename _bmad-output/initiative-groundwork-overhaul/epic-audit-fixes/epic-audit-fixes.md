---
type: epic
title: "Audit fixes: private, operable, consistent"
parent: initiative-groundwork-overhaul
covers: [CAP-1, CAP-2, CAP-6, CAP-7, CAP-9, CAP-10]
after: []
assignee: ""
risk: medium
---

# Audit fixes: private, operable, consistent

## Description

This epic closes the audit's user-facing faults that don't wait on the redesign:

- the author's CV details still in the interview book;
- privacy copy that says more than the site does;
- three keyboard traps and a broken skip link;
- an accessibility suite that only covers one theme on desktop;
- counts that disagree;
- missing share images and sitemap entries;
- error reporting that is off in production;
- a CI that skips the comments check.

It delivers CAP-1, CAP-2, CAP-6 and CAP-7 in full, the Sentry part of CAP-9 and the CI part of CAP-10.

## Outcome

Nobody can rebuild the author's history from the site. Keyboard users can operate every surface. The numbers and share cards readers see are true. Signal: the checks below all pass on production.

## Requirements

- CAP-1: No page identifies the author's employer history, home town or relocation, and the privacy copy is true. (SPEC; seo-content-roadmap.md C1, C6)
- CAP-2: Panels, modals, key handlers and skip links work for keyboard users, and axe passes in all nine themes at 1440 and 390. (SPEC; ux-a11y.md A1–A4, A9)
- CAP-6: One interview-question count, and no stale counts. (SPEC; C2–C4, C8)
- CAP-7: Share images on every page, breadcrumbs that name their topic, a correct sitemap, submitted to search engines. (SPEC; S1, S3, S8, roadmap t55)
- CAP-9 (part): Production client errors reach Sentry. (SPEC; code-quality.md finding 6)
- CAP-10 (part): CI runs `npm run comments`, with locked-down workflows. (SPEC; code-quality.md finding 7)

## Done when

1. A grep of `content/`, `lib/` and `.cspell/project-words.txt` for the earlier employer, home town and relocation month finds nothing, and `/privacy` exists, is in the sitemap and is linked from the FAQ.
2. The a11y e2e suite runs all nine themes at 1440 and 390, with no rule disabled, and passes.
3. `e2e/keyboard.spec.ts` passes at 390: no closed panel takes focus, and every open menu or sheet keeps focus and returns it on Escape.
4. `tests/claims.test.ts` asserts the interview-question count, the JavaScript tagline and the language counts, and the home page, question bank, `/practice`, README and `docs/ROADMAP.md` agree with the content.
5. Every sitemap URL emits `og:image`. The sitemap includes `/mock` and `/interview/questions` and excludes `/practice`.
6. A test error thrown on production appears in Sentry, and the CI log shows `npm run comments`.
7. Every entry is deployed to production from `main`, with `npm run check`, `npm run build` and `npm run test:e2e` green.

## Boundaries

These are site-wide fixes that touch many files lightly. The epic does not redesign any page or move any page onto the shared frame (epic-topic-redesign, epic-one-system), and it does not tighten the CSP (epic-one-system). The Playwright mobile project also belongs to epic-one-system; entry 3 sets its viewport inside the a11y spec.

## References

- spec — _bmad-output/specs/spec-groundwork-overhaul/SPEC.md, CAP-1, CAP-2, CAP-6, CAP-7, CAP-9, CAP-10
- audit — _bmad-output/planning-artifacts/audit-2026-09-28/seo-content-roadmap.md, C1, C2–C4, C6, C8, S1, S3, S8
- audit — _bmad-output/planning-artifacts/audit-2026-09-28/ux-a11y.md, A1–A4, A9, A11
- audit — _bmad-output/planning-artifacts/audit-2026-09-28/code-quality.md, findings 6 and 7
- roadmap — docs/roadmap.html, phase Audit fixes (t45–t56)

## Notes

- Decision: tracer bullet is entry 1, the privacy fix. It is the only high-severity content fault and needs no other entry (agent, 2026-09-28; confirm).
- Decision: no refactor sweep. The entries are independent fixes in different files with nothing to consolidate, and epic-one-system owns the cleanup (agent, 2026-09-28; confirm).
- Decision: the order follows shared files, not preference (agent, 2026-09-28):
  - Entry 3 waits on entry 2, because axe at 390 fails on the focusable closed sidebar until entry 2 makes it inert.
  - Entry 5 waits on entries 1 and 2, because it adds entry 1's `/privacy` to the sitemap and edits the same practice files as entry 2.
  - Entry 6 waits on entry 3, because both edit `arch-health.ts`.
  - Entry 7 waits on entries 1 and 5, because the privacy page names Sentry and it submits the fixed sitemap.
  - Entry 8 waits on entries 1 and 2, because it edits `HomeView.tsx` and `QuestionBank.tsx`.
- Decision: the stale `/soon` copy moved to epic-topic-redesign entry 2, which makes `/soon` render and edits the same file (agent, 2026-09-28).
- Open question: which interview-question count is true, 209, 245 or 420+? Entry 8 waits on it.
- Unknown: whether switching `scrollable-region-focusable` back on surfaces failures outside the known list. Entry 3 owns the answer.
