---
type: epic
title: "Fast on phones"
parent: initiative-groundwork-overhaul
covers: [CAP-5]
after: []
assignee: ""
risk: medium
---

# Fast on phones

## Description

Mobile Lighthouse rises from 72–89 to at least 90 on the pages readers use most. The work:

- the Playground paints from server HTML;
- the mock room stops downloading every exercise;
- render-blocking CSS shrinks to what a page uses;
- Radix Select leaves the global bundle;
- scroll effects stop thrashing layout;
- fonts slim down;
- the TypeScript check leaves the main thread;
- prefetch and repeated payloads are trimmed.

The `/path` half of CAP-5 is epic-topic-redesign entry 8.

## Outcome

A reader on a mid-range phone sees content quickly on every page. The signal is CAP-5: Lighthouse mobile ≥ 90 on `/`, `/notes`, a chapter, `/problems/<id>`, `/practice` and `/path`.

## Done when

1. Lighthouse mobile (the PSI settings in performance.md) scores at least 90 on the six CAP-5 pages, over a median of three runs.
2. The server HTML of the Playground contains its heading and editor shell. Mobile LCP on the Playground is under 2.5 s with the throttle in performance.md.
3. A mock session downloads one exercise's data, not `content/practice`.
4. A homepage scroll at 4× CPU costs under 1.5 s of main-thread time (3.8 s today).
5. Deployed from `main` with `npm run check`, `npm run build` and `npm run test:e2e` green. The build lists no new dynamic route.

## Boundaries

Client weight and rendering only. It does not delete Shell or split its CSS for topic pages (epic-topic-redesign), and it does not change content.

## References

- spec — _bmad-output/specs/spec-groundwork-overhaul/SPEC.md, CAP-5 and Constraints (pages stay prerendered)
- audit — _bmad-output/planning-artifacts/audit-2026-09-28/performance.md, P1–P8, the ranked opportunities and the per-page tables
- roadmap — docs/roadmap.html, phase Fast on phones (t67–t74)

## Notes

- Waits on epic-audit-fixes because: the Playground (t67) and mock room (t68) work edits files that epic 1 entries 2 and 5 change first.
- Waits on epic-topic-redesign because the work below depends on Shell or its CSS until entry 10 deletes them:
  - the CSS split (t69);
  - the Radix picker (t70), rendered by Shell's ThemeFontPicker;
  - the scroll-effect rework (t71), which includes ReaderShell's progress bar;
  - the duplicate-Shell trim (t74).
- Assumption: at inception, the Playground and mock-room entries (t67, t68) and the font diet (t72) can be pinned only on epic 1, so they may be pulled ahead of the topic redesign if the user wants the quick wins early. The initiative's `tickets.toml` gates the whole epic until then.
