---
type: epic
title: "Every topic page on the shared frame"
parent: initiative-groundwork-overhaul
covers: [CAP-3, CAP-4, CAP-5, CAP-8]
after: []
assignee: ""
risk: high
---

# Every topic page on the shared frame

## Description

Every topic page moves off the old notebook sidebar and onto the frame the redesigned pages already use: the cover, the chapter reader, the level and path pages, and unwritten topics. The chapter reader gets a readable column, section contents with links, a header pager and a clear Mark as read. Unwritten topics get an honest roadmap page instead of a level picker. When every consumer is gone, the old `Shell`, `ReaderShell` and their global CSS are deleted. The design brief is `topics.md` §3; this epic delivers CAP-3 and CAP-4, the `/path` half of CAP-5 and the Shell half of CAP-8.

## Outcome

A reader on any topic, on a phone or a desktop, stays in one frame from cover to chapter to path. The spec's three-tap phone walk (open `/notes`, Continue, jump to a Closures section) is the signal.

## Requirements

- CAP-3: Topic pages share the frame of the redesigned pages. Covers group chapters by level with Continue; chapters have a ≤760px column, h3 ids and on-page contents. (SPEC, Capabilities)
- CAP-4: Unwritten topics show a roadmap, never a level picker or "0 / 0"; unknown chapter slugs return 404. (SPEC, Capabilities)
- CAP-5 (part): `/path` renders its content in server HTML without becoming dynamic. (SPEC, Capabilities; performance.md P1)
- CAP-8 (part): the shared frame the rest of the site converges on (entry 1), the git and architecture series on it (entry 9), and `components/Shell.tsx`, `components/reader/ReaderShell.tsx` and their global CSS gone once nothing renders them (entry 10). The other pages' convergence, the brand mark and the token scale are epic-one-system's. (SPEC, Capabilities)

## Done when

1. `/notes`, `/react`, `/dsa` and `/system-design`, a chapter of each, `/level/js` and `/path` for js/beginner all render `header a.head-back` and pass the a11y suite in light and dark at 1440 and 390.
2. At 1440, a chapter paragraph is at most 760px wide, and every `h3` in the chapter is linked from the on-page contents.
3. `/typescript` and `/soon?topic=typescript` show the outline roadmap in server HTML. `/notes/nope` returns 404. No topic page shows "0 / 0" or minutes for unwritten chapters.
4. The server HTML for `/path` contains the step titles, and the build still reports no dynamic page routes.
5. `rg "components/Shell|ReaderShell|CoverMap" app components lib` finds nothing. Every number in `content/architecture/` still passes `tests/claims.test.ts`.
6. Deployed to production from `main`, with `npm run check`, `npm run build` and `npm run test:e2e` green.

## Boundaries

This epic owns the topic UI: the 18 generic topic routes, `/level`, `/path`, `/soon`, and the git and architecture series headers. It does not cover the home, mock, interview book, review or progress pages (epic-one-system moves them onto the frame), and it writes no chapter content. The hard-coded "JS" brand mark (ux-a11y.md N3, roadmap t20) is epic-one-system's. See the spec's Non-goals.

## References

- spec — _bmad-output/specs/spec-groundwork-overhaul/SPEC.md, CAP-3, CAP-4, CAP-5, CAP-8 and Constraints
- design — _bmad-output/planning-artifacts/audit-2026-09-28/topics.md, §3.1–3.6 (principles, frame props, target IA per page, reuse plan, must-not-regress list, stories)
- constraint — _bmad-output/planning-artifacts/audit-2026-09-28/topics.md, §1.6, the e2e, a11y, unit-test and architecture-chapter contracts
- audit — _bmad-output/planning-artifacts/audit-2026-09-28/ux-a11y.md, N1–N3, U1–U2, R1
- audit — _bmad-output/planning-artifacts/audit-2026-09-28/performance.md, P1 (`/path`)
- constraint — AGENTS.md, Conventions and Known pitfalls

## Notes

- Decision: tracer bullet is entry 1. The shared frame renders the existing JavaScript cover content on `/notes`, which proves the frame, the menu, scroll-fx and the topic props on a real topic route before any page is redesigned. This departs from topics.md TP-1 ("no visual change") only for `/notes` (agent, 2026-09-28; confirm).
- Decision: entry 2 (routing fixes) sits second in the table as a parallel lane. It shares no file with entry 1 or 3. In the frame lane, the least certain slice, the chapter reader (entry 3), comes straight after the tracer (agent, 2026-09-28).
- Decision: the chapter reader (entry 3) goes before the cover (entry 4). It is the least certain and most-read page. Both edit `components/reader/topicPages.tsx`, so the cover waits for it (agent, 2026-09-28; confirm).
- Decision: shared files set the rest of the order (agent, 2026-09-28):
  - Entry 5 waits on entry 4 (`topicPages.tsx`).
  - Entry 8 waits on entry 7 (level links, `navHref`, `.level` and `.step` rules).
  - Entry 9 waits on entry 4 (PartSection, ChapterCard and the `landing.module.css` split).
- Decision: each entry that changes a route, a count or the reader updates the How this is built chapter that describes it, and the entry names the file (spec Constraints).
- Decision (user, 2026-09-30): this epic runs before initiative-dsa-mastery and keeps `/dsa` in entries 3, 4, 7 and 8. The DSA initiative later adds optional slots to the parts built here: a completion policy read by every tick surface (end card, rail, cover card, path step), a cover aside and chapter-body islands. Keep those parts open to optional props, and keep tick logic in one place per surface.
- Waits on epic-audit-fixes because:
  - entry 1 needs epic 1 entry 2's focus handling for the sheet it extracts, and entry 3's a11y harness for the light and dark matrix in Done when 1;
  - entry 2 edits the claims test, `content/topics.ts` and the sitemap after epic 1 entries 4 and 5.
- Decision: `e2e/smoke.spec.ts` is edited by several entries. Each merges in build order, rebased on `main`, so the edits never run in parallel (agent, 2026-09-28).
- Assumption: outline topics land on their own cover URL, and `/soon?topic=` redirects there (spec Assumptions).
- Assumption: `/path` moves to static segments or a per-topic server shell rather than reading `searchParams` at request time (spec Assumptions and Constraints).
- Open question: keep, move or drop the old sidebar widgets (daily recap, clock and weather, streak, today's pick). Entry 10 waits on it.
- Assumption: until the user answers, the widgets are simply absent from each topic page as it moves to the frame (entries 1, 3, 4, 7 and 8), and entry 10 restores them where the user wants them.
- Open question: GraphQL, Redis and Kubernetes outline sizes. Entry 6 shows whichever sizes `content/topics.ts` holds, so this does not block it.
