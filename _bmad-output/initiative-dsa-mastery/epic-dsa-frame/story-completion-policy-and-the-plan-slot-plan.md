---
title: 'Completion policy and the plan slot'
type: 'feature'
ticket: '3'
created: '2026-10-07'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/specs/spec-dsa-mastery/quiz-and-placement.md']
warnings: []
deferred:
  - summary: >-
      The unit-test totals in the architecture chapters ("307 unit tests", "19 files", "307 of 307") are stale and asserted nowhere.
    evidence: |-
      Vitest now runs 385 tests in 25 files. Same item as the one deferred by story 1.2; derive and assert it in the frame sweep.
    location: >-
      content/architecture/arch-testing.ts, arch-health.ts
    severity: low
  - summary: >-
      The "tick link or toggle button" choice is repeated in ChapterCard, ChapterEnd, TocCard and TopicPath, each with its own link-flattening CSS.
    evidence: |-
      A single TickControl component would remove the duplication and keep the state attributes consistent; deferred to the frame sweep to keep this story's diff small.
    location: >-
      components/chapter/ChapterCard.tsx, ChapterEnd.tsx, TocCard.tsx, components/topic/TopicPath.tsx
    severity: low
baseline_revision: '655661347ee8ddb51918b5f5dbf159d2ac561962'
---

<intent-contract>

## Intent

**Problem:** Every place that ticks or counts a chapter as done in the topic frame toggles the read mark directly. A topic whose chapters must pass a check before they count (DSA, `Topic.completion: "quiz"`) needs those places to send the reader to the check instead, and to agree with each other. "What is the next chapter" is also decided separately in three places, so a later plan cannot steer it.

**Approach:** Add one small client-safe module, `lib/completion.ts`, that every tick surface and every "next chapter" decision asks. For `completion: "quiz"` a chapter's tick becomes a link to `<chapter>#check`; for any other value it behaves exactly as today. Add an optional cover aside slot and a server-rendered stub Check island in the end card of quiz topics. Every other topic, and the Git and How this is built pages, stay unchanged.

## Boundaries & Constraints

**Always:** `completion` undefined or `"read"` must reproduce today's behaviour byte for byte: the same buttons, labels, `aria-pressed`, `data-done`, counts and e2e tests. The policy lives in one module with no imports from `content/*` (the client-bundle test forbids it); server pages pass the `completion` string down as a prop, not a function. For `"quiz"`: the end card's Mark as read, the contents card's Mark as read, the cover card tick and the path step tick become links to `<chapter page>#check` (on the chapter's own page just `#check`), and show the same done state as before (the read mark). The rail and the phone Chapters sheet show the tick as a state badge inside the chapter link; they stay display-only and read the same done set. "Next chapter" for Continue, Up next, the path's next step and the budget reach goes through one function `nextChapter(completion, chapters, done)` whose result for every topic today is the first unread chapter; story 3.7 will extend it with the placement plan. The stub Check island is a server-rendered `section` with `id="check"` that appears only for quiz topics, says the chapter check is not built yet, offers no control, has no heading, and carries `data-island="check"` and `data-speech-exclude`. The optional cover `aside` slot renders nothing when absent. Style with theme tokens; add no CSS module (use `components/topic/reader.module.css` and `cover.module.css`). Update the How this is built chapter that describes ticks and counts any asserted number. No comments in source.

**Never:** Do not change `components/series/*` pages' behaviour (Git, How this is built), `ChapterRail`'s or `ChaptersSheet`'s behaviour, the check itself (3.2), the plan or placement (3.7), check states checked/not checked (3.4), or `progress.setChapterDone`/`lib/storage`. Do not hard-code `"dsa"` anywhere; only `completion` decides. Do not import `lib/content` or `lib/topics` into a client file.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Quiz chapter end card | `/dsa/dsa-binary-search` | Mark as read is a link to `#check`; the stub Check island with `id="check"` sits above it; the read state and counts are unchanged | none |
| Quiz tick elsewhere | `/dsa` cover card, contents card, `/path/dsa/beginner` step | each tick is a link to `/dsa/<id>#check` (cover and path) or `#check` (own page); a done chapter still shows done | none |
| Other topic | `/notes`, `/react`, `/git`, `/architecture` | exactly as today, no `#check`, no stub | none |
| Continue | any topic with no plan | opens the first unread chapter as before; with every chapter read it goes to `/review` as before | none |
| Slot | cover without an `aside` | layout identical to today | none |

</intent-contract>

## Code Map

- `lib/completion.ts` (new, client-safe, no content imports) -- `type Completion = "read" | "quiz"`; `tickHref(completion, basePath, chapterId, here?)` returning `null` for read or undefined and `#check` (here) or `<basePath>/<chapterId>#check` for quiz; `nextChapter<T extends { id: string }>(completion, chapters: T[], done: Set<string>): T | null` returning `chapters.find((c) => !done.has(c.id)) ?? null`. `Completion` already exists as `Topic["completion"]` in `content/types.ts:33`; import the type only.
- `components/reader/topicPages.tsx:33,51-63,159,185-200` -- derive `completion` from the topic (`topic(topicId)?.completion`) and pass it to `TopicCover` and `TopicReader`.
- `components/topic/TopicReader.tsx:78-94,256-269` -- new `completion?: Completion` prop; `tickHref(completion, basePath, chapter.id, true)` goes to `ChapterEnd` and `TocCard` as a new optional `tickHref`; render the stub `CheckIsland` between the practice strip and `ChapterEnd` when `completion === "quiz"`. `toggleRead` stays for the non-quiz path.
- `components/chapter/ChapterEnd.tsx:5-43`, `components/chapter/TocCard.tsx:64-74` -- new optional prop `tickHref?: string | null`; when set render a link (`next/link` or `a`) with the same visible text and classes in place of the button; with it absent the markup is unchanged (these also serve `components/series/ChapterView`). `.endBtn` needs link styling in `components/series/chapter.module.css` (display, text-decoration) without changing the button look.
- `components/chapter/ChapterCard.tsx:23,37-47` -- new optional `tickHref`; when set the tick is a link instead of the button; `onToggleRead` absent keeps `SeriesLanding` unchanged.
- `components/topic/TopicCover.tsx:61-70,120-167,192` and `components/topic/useReadingPlan.ts:42,48,76` -- take `completion`; `useReadingPlan(stations, topicId, completion)` uses `nextChapter` for `next` (and therefore `reach`); cards get `tickHref`; add optional `aside?: React.ReactNode` rendered beside Up next in the hero (a flex-column wrapper in `components/topic/cover.module.css`, grid at lines 7-12 and 216-220).
- `components/topic/TopicPath.tsx:46-63,174-210` -- already receives `topic: Topic`; read `topic.completion`; step tick becomes a link for quiz; `next` through `nextChapter`.
- `components/play/PlayIsland.tsx` and `components/topic/reader.module.css:115-137` -- the pattern for a server-rendered island; new `components/check/CheckIsland.tsx` (server-safe) styled with new rules in `reader.module.css`.
- `e2e/smoke.spec.ts:414-419` -- the DSA cover test counts distinct raw `a[href^="/dsa/dsa-"]` hrefs and expects 42: tick links add `#check` variants, so strip query and hash before the set. Tests that must pass unchanged: `:144-148`, `:177-203`, `:216-269`, `:317-360`, `:1160-1177`, `:1214-1239`, `:1340-1360`; `e2e/a11y.spec.ts:151-163`.
- `tests/completion.test.ts` (new) -- `tickHref` and `nextChapter` cases (read, undefined, quiz on own page and elsewhere, all read returns null, empty list).
- `content/architecture/arch-rendering.ts`, `arch-state.ts` and `tests/claims.test.ts` -- one or two true sentences on the completion policy and keep asserted counts (browser tests, spec counts, a11y pages) true.

## Tasks & Acceptance

**Execution:**
- [x] `lib/completion.ts`, `tests/completion.test.ts` -- the one policy and its unit tests -- every surface asks the same thing
- [x] `components/chapter/ChapterEnd.tsx`, `TocCard.tsx`, `ChapterCard.tsx`, `components/series/chapter.module.css` -- optional `tickHref`, link rendering -- unchanged when absent
- [x] `components/topic/TopicReader.tsx`, `TopicCover.tsx`, `useReadingPlan.ts`, `TopicPath.tsx`, `components/reader/topicPages.tsx` -- pass and use `completion`, `nextChapter`, the `aside` slot -- the quiz topic ticks link to `#check`
- [x] `components/check/CheckIsland.tsx`, `reader.module.css`, `cover.module.css` -- the stub island and the aside wrapper -- mount points for 3.2 and 3.7
- [x] `e2e/smoke.spec.ts` -- the DSA href count fix and a test for the DSA ticks, the stub and an untouched `/notes` chapter -- proof on real pages
- [x] `content/architecture/*`, claims -- truthful prose and counts

**Acceptance Criteria:**
- Given `/dsa/dsa-binary-search`, then the end card and contents card Mark as read are links to `#check`, `#check` exists as the stub Check island, and the chapter's read state and counts are as before.
- Given `/dsa` and `/path/dsa/beginner`, then each chapter tick is a link ending `#check` and Continue still opens the first unread chapter.
- Given the phone Chapters sheet on a DSA chapter, then it lists the same done state as the rail.
- Given `/notes`, `/react`, `/git` and `/architecture`, then their ticks, Continue, review and counts pass the existing e2e tests unchanged and no `#check` appears.
- Given `npm run check`, `npm run build` and the full `npm run test:e2e`, then all pass (axe included).

## Implementation Notes

- `lib/completion.ts` has `tickHref(completion, basePath, chapterId, here, done)`, `nextChapter(completion, chapters, done)` and a small `requiresCheck`. `tickHref` returns null for a read topic and for a chapter that is already read, so a read quiz chapter keeps today's toggle button (unmark stays free) and only an unread one links to `#check`.
- The rail and the phone Chapters sheet show the tick as a state badge inside the chapter link, so they are not separate links to `#check`; they read the same done set, which a 390px e2e checks. This is the plan's reading of "every tick links to #check".
- `nextChapter` takes `completion` and ignores it today; story 3.7 extends it with the placement plan.
- Until the check ships (3.2) an unread DSA chapter cannot be marked read on this integration branch: its tick goes to the stub, which says marking is paused. The stub must not reach production.
- `withHeadingIds` now reserves the id `check` so a heading cannot collide with the island.

## Plan Change Log

## Review Triage Log

### 2026-10-07 — Review pass
- verdicts: 24 findings — high 0, medium 4, low 19, false 1, maybe-false 0
- findings:
  - `[low]` `[defer]` blind-hunter: the unit-test totals in the architecture chapters are stale — not asserted anywhere and already stale before this story; frame sweep
  - `[low]` `[patch]` blind-hunter: the stub prints — added to the print hide list
  - `[low]` `[patch]` blind-hunter: tick links read as mutations and drop `aria-pressed` — a read chapter keeps its button with `aria-pressed`; only an unread chapter links, and following it starts the mark-done flow
  - `[medium]` `[patch]` blind-hunter: a quiz topic is a dead end, nothing can mark or unmark a chapter — a read chapter keeps its toggle button; the stub says marking is paused until the check ships
  - `[low]` `[patch]` blind-hunter: the hash jump gives no focus — the stub has `tabindex="-1"` and says why marking is paused
  - `[low]` `[patch]` blind-hunter: the `check` id is not reserved — `withHeadingIds` reserves it, with a unit test
  - `[low]` `[reject]` blind-hunter: `nextChapter` ignores its argument — deliberate, story 3.7 extends it
  - `[low]` `[patch]` blind-hunter: acceptance coverage is incomplete — a 390px test of the Chapters sheet was added; the unused `aside` slot has nothing to test yet
  - `[low]` `[reject]` blind-hunter: the new e2e is one large test — kept as one flow to share a seeded page
  - `[low]` `[defer]` blind-hunter: the link-or-button ternary repeats in four components — a single `TickControl` in the frame sweep
  - `[false]` `[reject]` blind-hunter: the plan file is stale — closed out at Finalize
  - `[medium]` `[patch]` edge-case-hunter: no surface can mark or unmark a quiz chapter — same fix as above
  - `[low]` `[patch]` edge-case-hunter: a heading titled "Check" collides with the island id — same fix as above
  - `[low]` `[patch]` edge-case-hunter: the print hide list omits the stub — same fix as above
  - `[low]` `[defer]` edge-case-hunter: architecture unit-test counts stale — same as above
  - `[low]` `[patch]` verification-gap: nothing asserts outline chapters get no tick on `/dsa` — an assertion over all eight outline ids
  - `[low]` `[defer]` verification-gap: unit-test counts stale — same as above
  - `[medium]` `[patch]` verification-gap: a read DSA chapter cannot be unmarked and the e2e pins it — read chapters keep the button and the e2e asserts it
  - `[low]` `[patch]` verification-gap: the prose says the module imports no content though it has a type import — now "no runtime content imports"
  - `[low]` `[reject]` intent-alignment: the rail and the sheet ticks are not links to `#check` — they are state badges inside the chapter link and read the same done set; recorded in Implementation Notes
  - `[low]` `[reject]` intent-alignment: read counts and progress do not ask the policy — the state is still the read mark; checked and not-checked states arrive in 3.4
  - `[low]` `[reject]` intent-alignment: `nextChapter` is an identity wrapper today — by plan
  - `[low]` `[patch]` intent-alignment: only a 1440px test and the sheet never opened — the 390px sheet test
  - `[medium]` `[patch]` intent-alignment: unmarking is lost although CAP-2 keeps it free — same fix as the dead end

## Design Notes

A function cannot cross from a server page to a client component, so the policy is a string prop plus a client-side module. When 3.7 adds the placement plan it extends `nextChapter` to read the placement store; nothing else changes.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: green
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` then `npm run test:e2e` -- expected: all pass

**Manual checks (if no CLI):**
- Screenshot `/dsa/dsa-binary-search` (end card, stub), `/dsa` and `/path/dsa/beginner` at 1440 and 390 on a throwaway port (not 3000) with reduced motion; ticks look like the existing ones and read as links.

## Auto Run Result

**Summary:** One completion policy (`lib/completion.ts`) now decides every tick control and every next-chapter choice in the topic frame. For a quiz topic an unread chapter's tick links to `<chapter>#check` and a read chapter keeps its toggle button, so unmarking stays free. The end card of a quiz chapter holds a stub Check island (`#check`), and the cover takes an optional `aside` slot. Continue, Up next and the path's next step ask one `nextChapter` function. Every other topic, Git and How this is built are unchanged.

**Files changed:** `lib/completion.ts`, `lib/headingToc.ts`, `components/chapter/ChapterEnd.tsx`, `TocCard.tsx`, `ChapterCard.tsx`, `components/check/CheckIsland.tsx`, `components/topic/TopicReader.tsx`, `TopicCover.tsx`, `TopicPath.tsx`, `useReadingPlan.ts`, `components/reader/topicPages.tsx`, four CSS modules, `tests/completion.test.ts`, `tests/heading-toc.test.ts`, `e2e/smoke.spec.ts`, and the architecture chapters that state the counts.

**Review:** 24 findings: medium 4 (one root cause: nothing could mark or unmark a quiz chapter), low 19, false 1. Patched 8 entries, deferred 2 low (stale unit-test totals; a shared tick component) to the frame sweep, rejected the rest with reasons logged above.

**Follow-up review recommended:** false. One medium entry patched, no high.

**Verification:** `npm run check` 385 unit tests, build ok, full `npm run test:e2e` 194/194 including axe; screenshots of the end card and stub, `/dsa` and `/path/dsa/beginner` at 1440 and 390 taken before the review patches.

**Residual risks:** until story 3.2 ships the check, an unread DSA chapter cannot be marked read on this branch, and the stub must not reach production; the architecture chapters' unit-test totals stay stale until the frame sweep.
