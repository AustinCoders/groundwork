---
title: 'TP-4 · Unwritten chapters and the loading skeleton'
type: 'feature'
ticket: '5'
created: '2026-10-01'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/planning-artifacts/audit-2026-09-28/topics.md']
warnings: []
deferred:
  - summary: >-
      No test exercises throttled navigation or CLS to directly verify the "no layout jump"
      acceptance criterion.
    evidence: |-
      The mechanism (identical chapter.module.css/reader.module.css grid classes shared by
      ChapterSkeleton and both TopicReader/TopicOutlineChapter) was independently confirmed
      structurally. No throttle/CLS test infrastructure exists anywhere in the repo to extend.
      Worth a dedicated visual-regression check if the suite grows one.
    location: >-
      components/reader/ChapterSkeleton.tsx
    severity: low
baseline_revision: '5b9987dfea82a95ab3512a20aa251c011ea38cb4'
---

<intent-contract>

## Intent

**Problem:** Outline (unwritten) chapters still render through the old `ReaderShell`/`ChapterSheet` (a `.soon-stamp` plus a bullet list), separate from the `TopicReader` family TP-3 built for written chapters. The shared `ChapterSkeleton` loading state (one `loading.tsx` per topic, 18 total) still matches neither grid, so navigating to any chapter shows a layout jump.

**Approach:** Give outline chapters a `TopicOutlineChapter` component in the same `TopicFrame`/shared-parts family as `TopicReader` — a roadmap card (`syllabusSectionForChapter`'s title + items) in place of the body, "Meanwhile" links to a related written topic and its interview round via a new `lib/topicRelated.ts`, and prev/next scoped to the topic's own outline chapters. Restyle `ChapterSkeleton` to the shared `chapter.module.css` grid (rail/article/aside) so it matches whichever of the two readers the real page turns out to be.

## Boundaries & Constraints

**Always:**
- `TopicChapterPage` (`topicPages.tsx`) keeps its `chapter.ready` branch; the `!ready` arm now renders `TopicFrame` + `TopicOutlineChapter` instead of `ReaderShell`/`ChapterSheet`. `ReaderShell`/`ChapterSheet` stay for the cover's outline-topic fallback (`CoverSheet`, untouched by this story).
- `lib/topicRelated.ts` (new): `RELATED_TOPIC: Record<string,string>` mapping an outline topic id to one written topic id, mirroring `RELATED_INTERVIEW_ROUND`'s shape (`lib/topics.ts:91-100`) exactly. Explicit entries per the design brief: `typescript→js`, `nextjs→react`, `node→js`, `nestjs→js`; every other outline topic (html, css, docker, databases, testing, security, cloud-devops, graphql, redis, kubernetes) defaults to `js`, the most foundational written topic — an explicit assumption, recorded in Design Notes, not a guess per topic. The interview-round half of "Meanwhile" is derived, not stored twice: `relatedInterviewRound(relatedTopicId)` (already built in TP-2) on the resolved related topic.
- `TopicOutlineChapter` reuses `ChapterRail` (no search slot — outline content has nothing worth indexing), `ChaptersSheet`, `useChapterKeys` (prev/next only, no `/` slash since there is no search), `ChapterHeaderPager`; no `TocCard` (no real headings) and no Listen button, matching topics.md's explicit list for this state.
- The roadmap card's heading and items come from `syllabusSectionForChapter(chapterId, topicId)` — `.section.title` and `.section.items` (`lib/content.ts:38-52`), the same data `ChapterSheet.tsx` already reads, through `escapeHtml`.
- prev/next are computed over `chapters(topicId).filter(c => !c.ready)` only — an outline chapter never links to a written one as prev/next (parity with how TP-3 scoped written-chapter prev/next to ready chapters only).
- `ChapterSkeleton.tsx` imports `components/series/chapter.module.css`'s existing grid classes (`.page`, `.body`, `.left`, `.main`, `.right`) for structure, plus new, minimal shimmer-block styles — not a notebook `.sheet` skeleton. It is shared by all 18 `[chapter]/loading.tsx` files (both ready and outline topics); it must not regress the written-chapter loading state TP-3 left unaddressed.
- `topicChapterMetadata`'s existing `index: ch.ready` (`topicPages.tsx:112`) is unchanged — outline chapters stay `noindex`.
- No comments. Theme tokens only.

**Never:**
- Do not touch the cover's own outline path (`CoverSheet`/`CoverMap`/`ReaderShell` for covers) — only the per-chapter route changes.
- Do not build a topic-to-topic relationship beyond the simple one-write-topic map named above; do not infer "closest" topics by content similarity.
- Do not add a search box or Listen button to the outline reader.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Outline chapter | `/typescript/ts-setup-compiler` | Roadmap card (section title + items), Meanwhile → JS + R3, prev/next among TS's own outline chapters, `noindex` kept | No error |
| First/last outline chapter | A topic's first or last outline section | Prev or next card omitted or shows "The cover" fallback, same pattern as `ChapterPager` | No error |
| Loading state | Throttled nav between two chapters (either kind) | Skeleton's grid matches the real page's grid; no layout jump | No error |
| Written chapter unaffected | `/notes/closures` | Unchanged `TopicReader` rendering and loading skeleton shape | No error |
| Unmapped-default topic | `/docker/<any outline chapter>` | Meanwhile points to JS (the default), not a guessed "closer" topic | No error |

</intent-contract>

## Code Map

- `components/reader/topicPages.tsx` `TopicChapterPage` (the `!chapter.ready` arm) -- replace `ReaderShell`+`ChapterSheet` with `TopicFrame`+`TopicOutlineChapter`; build the outline `cards`/`prev`/`next` the same way the `ready` arm already builds its `SeriesCard[]`.
- `lib/content.ts:38-52` `syllabusSectionForChapter` -- the roadmap card's data source, unchanged.
- `lib/topics.ts:91-100` `RELATED_INTERVIEW_ROUND`/`relatedInterviewRound` -- the shape to mirror for `lib/topicRelated.ts`, and the function this story's "Meanwhile" round link calls directly.
- `components/topic/TopicOutlineChapter.tsx` (new) -- composes `TopicFrame` (via the caller), `ChapterRail` (no `search` prop), `ChaptersSheet`, `useChapterKeys`, `ChapterHeaderPager`, the roadmap card, the Meanwhile block, `ChapterPager` (scoped to outline cards).
- `components/reader/ChapterSkeleton.tsx` (31 lines) + its CSS -- restyle onto `components/series/chapter.module.css`'s `.page`/`.body`/`.left`/`.main`/`.right` grid classes; referenced unchanged by all 18 `app/<topic>/[chapter]/loading.tsx` files (no file-level changes needed there).
- `content/architecture/arch-coming-soon.ts:72-73` -- "every outlined chapter has its own page showing a 'not written yet' stamp" is now false; rewrite for the roadmap card. L76-81 (noindex/sitemap/search exclusion) stays true, unchanged.
- `e2e/smoke.spec.ts:265-274` -- full rewrite: new assertions for the roadmap card, Meanwhile links, scoped prev/next, `[data-scrollbar]` now present (was asserted absent).
- `e2e/a11y.spec.ts` -- add a state for an outline chapter page (none exists today).
- `tests/claims.test.ts` -- update counts after implementation.

## Tasks & Acceptance

**Execution:**
- [ ] `lib/topicRelated.ts` -- the outline→written topic map + accessor -- mirrors `RELATED_INTERVIEW_ROUND`'s shape
- [ ] `components/topic/TopicOutlineChapter.tsx` -- the new outline reader -- the story's deliverable
- [ ] `components/reader/topicPages.tsx` -- the `!ready` arm now renders it -- single dispatch point unchanged from TP-3
- [ ] `components/reader/ChapterSkeleton.tsx` -- restyle onto the shared grid -- closes the layout-jump gap
- [ ] `content/architecture/arch-coming-soon.ts` -- truthful prose -- keeps claims honest
- [ ] `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts` -- rewrite the outline-chapter test, add an a11y state -- regression guard

**Acceptance Criteria:**
- Given `/typescript/ts-setup-compiler`, when it renders, then it shows the section's items, a Meanwhile link to JS and R3, and prev/next among TypeScript's own outline chapters, still `noindex`.
- Given a throttled client-side navigation between two chapters, when the skeleton shows, then its grid matches the real page's grid with no visible jump.
- Given `npm run check`, `npm run build` and `npm run test:e2e`, when they run, then all pass.

## Implementation Notes

- Implemented by a step-03 subagent in one pass, paused overnight at the user's request right before review, then resumed cleanly the next session with the working tree untouched.
- Review round: all 6 patch-group fixes were applied by the same subagent, re-engaged successfully. The review also surfaced an intent gap in this plan's own Code Map — it named only `arch-coming-soon.ts` for architecture prose, missing `arch-content-model.ts` and `arch-build.ts`, both of which also described the old "not written yet" stamp — fixed as part of the patch round rather than a full bad_plan loopback, since the fix was small and well-specified (two more prose passages, same shape as the one already planned).
- Verification after the patch round: `npm run check` (335/335 unit tests), `npm run build`, and full `npm run test:e2e` at `--workers=3`: 177/180 (the 3 known pre-existing, unrelated `/notes/setup-mental-model`/`/notes/basic-async` contrast/focus failures persist identically across every story this session has touched).

## Plan Change Log

## Review Triage Log

### 2026-10-01 — Review pass
- verdicts: 19 findings — high 0, medium 4, low 10, false 5, maybe-false 0
- findings:
  - `[medium]` `[patch]` blind-hunter: `arch-rendering.ts` (L26, L82) still says an outline chapter renders `ReaderShell` with `ChapterSheet` passed in as children, and that `TopicReader` plays "the same role `ChapterSheet` plays for an outline chapter" — both now false; outline chapters render `TopicOutlineChapter`, and `ChapterSheet` is unused. Verified by reading both the diff and the current file.
  - `[medium]` `[patch]` blind-hunter: same file also claims the outline path's "only client code" is `ChapterDone`/`PracticeStrip` — neither is imported by `TopicOutlineChapter.tsx`. Same fix closes this too.
  - `[medium]` `[patch]` edge-case-hunter: same root cause, found independently, same fix.
  - `[medium]` `[patch]` blind-hunter: `content/architecture/arch-content-model.ts:155-156` and `content/architecture/arch-build.ts:75` both still describe an outline chapter as showing "a 'not written yet' stamp"/sheet — stale prose this story's Code Map didn't name (an intent gap in the plan's own file list, not the implementer's deviation). Verified both files still carry this wording. Fix: rewrite both passages for the roadmap card, Meanwhile link and scoped prev/next.
  - `[low]` `[patch]` blind-hunter: `components/reader/ChapterSheet.tsx` is now dead code — zero importers anywhere in the repo (the `!ready` arm of `TopicChapterPage` no longer renders it, and nothing else ever did). Verified by repo-wide grep. Fix: delete the file.
  - `[low]` `[patch]` edge-case-hunter: same finding, found independently, same fix.
  - `[low]` `[patch]` verification-gap: noted the same dead file in passing while tracing the main change.
  - `[low]` `[patch]` edge-case-hunter: `app/globals.css`'s old `.chapter--skeleton`/`.ch-sk__*` rules (L7981-8011) are now unreferenced — `ChapterSkeleton.tsx` was rewritten onto `chapter.module.css`/`reader.module.css` classes instead. Verified by reading both files. Fix: delete the dead CSS.
  - `[low]` `[patch]` verification-gap: same finding, found independently.
  - `[low]` `[patch]` edge-case-hunter: `relatedTopicId()` (`lib/topicRelated.ts:8-10`) has no guard against resolving to the topic the reader is already on — if `js` (or any topic not in `RELATED_TOPIC`) ever gained an outline chapter, its own "Meanwhile" card would link back to itself. Verified: currently unreachable (every topic today is either fully written or fully outlined, confirmed against real content), but the guard is free. Fix: a one-line check, `topicId === fallback ? secondChoice : fallback`.
  - `[low]` `[patch]` blind-hunter: same finding, found independently, same fix.
  - `[false]` `[reject]` blind-hunter: claimed the roadmap card's `items = found ? found.section.items : []` has no fallback copy for a missing syllabus section, risking an empty bullet list under the "This chapter will cover" heading — refuted: this is the exact same fallback expression the pre-existing `ChapterSheet.tsx` already used (`const planned = found ? found.section.items : [];`), copied verbatim, not a new risk this diff introduced.
  - `[low]` `[patch]` blind-hunter: the rewritten outline-chapter e2e test never asserts the "Not written yet." status text renders — the old test's one explicit assertion (`.soon-stamp` containing "not written yet") has no replacement. Verified: the text is present in the component (`readerStyles.status`) but untested. Fix: add the assertion.
  - `[false]` `[reject]` blind-hunter: claimed prev/next scoped to a topic's own outline chapters would skip a written chapter sandwiched between two outline ones in a partially-converted topic, untested — refuted by verification-gap's independent check: every topic today is either wholly written or wholly outlined (confirmed against real content across all four written and all fourteen outline topics), so this behavior is not currently distinguishable from the old whole-list pager for any topic that exists.
  - `[false]` `[reject]` blind-hunter: claimed `RELATED_TOPIC` silently defaulting every unlisted outline topic to `"js"` is a defect — not a deviation: this plan's own Boundaries and Design Notes explicitly named this exact default as a documented assumption, not a guess per topic.
  - `[false]` `[reject]` intent-alignment: claimed "Meanwhile links to written chapters" should link to a specific written chapter, not the diff's actual link to the related topic's cover (`/notes`, etc.) — refuted: topics.md's own worked examples for "Meanwhile" ("TS → JS and the interview round R3-TS; Next.js → React; Node/Nest → JS") are topic-level, not chapter-level, and this plan's own Boundaries explicitly specified "a related written topic," matching what was built.
  - `[false]` `[reject]` intent-alignment: noted "entry 6 reuses `lib/topicRelated.ts`" can't be verified by this diff alone — correct but not a defect; it's a claim about a future, out-of-scope consumer.
  - `[low]` `[defer]` intent-alignment: no test exercises throttled navigation/CLS to directly verify "no layout jump" — the mechanism (identical `chapter.module.css`/`reader.module.css` grid classes shared by the skeleton and both real reader variants) was independently confirmed structurally by edge-case-hunter's own methodology trace, and no throttle/CLS test infrastructure exists anywhere in the repo to extend (grepped, zero references). Worth a dedicated visual-regression check if the suite grows one; not a trivial addition today.
  - `[low]` `[reject]` intent-alignment: noted "keeps noindex" is verified only by the pre-existing, untouched `tests/seo.test.ts` rather than a new assertion in this diff — true, but that test already covers every topic/chapter generically and this diff doesn't touch `topicChapterMetadata`'s `index: ch.ready` at all, so re-asserting it here would be redundant.

## Design Notes

The "which written topic/round" question the ticket itself flags as unknown is resolved with the three explicit pairings the design brief names (TS, Next.js, Node/Nest), and a single documented default (everything else → JS) rather than inventing a bespoke "closest topic" judgment per outline topic — JS is the one topic every other topic's reader is most likely to already know, and the round link falls out of it for free via TP-2's `relatedInterviewRound`, so there is exactly one small map to maintain, not two.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (port 3100).

**Manual checks:**
- Throttle the network in devtools and click between two chapters (one outline, one written); confirm no visible layout shift from skeleton to loaded page, for both kinds.

## Auto Run Result

**Summary:** Outline (unwritten) chapters now render a new `components/topic/TopicOutlineChapter.tsx` inside `TopicFrame`, built from the same shared parts `TopicReader` uses (`ChapterRail` without a search slot, `ChaptersSheet`, `useChapterKeys`, `ChapterHeaderPager`, `ChapterPager`) — a roadmap card (`syllabusSectionForChapter`'s title + items) in place of the body, a "Meanwhile" link to a related written topic and its interview round via a new `lib/topicRelated.ts`, and prev/next scoped to the topic's own outline chapters. `ChapterSkeleton` was rewritten onto the same shared grid classes both reader variants use, so the loading state matches whichever kind of chapter resolves, closing a layout-jump gap TP-3 left open. `ChapterSheet.tsx`, now fully unused, was deleted.

**Files changed:** `components/topic/TopicOutlineChapter.tsx` (new, the outline reader); `lib/topicRelated.ts` (new, the topic-to-topic map); `components/reader/topicPages.tsx` (the `!ready` arm); `components/reader/ChapterSkeleton.tsx` (restyled onto the shared grid); `components/series/chapter.module.css`, `components/topic/reader.module.css` (new skeleton/roadmap/Meanwhile styles); `app/globals.css` (old skeleton CSS removed); `content/architecture/arch-coming-soon.ts`, `arch-rendering.ts`, `arch-content-model.ts`, `arch-build.ts`, `arch-design-system.ts`, `arch-testing.ts`, `arch-health.ts` (truthful prose, updated counts); `e2e/smoke.spec.ts`, `a11y.spec.ts` (rewritten outline-chapter test, new a11y state).

**Review findings:** 19 findings (medium 4, low 10, false 5). 6 patched: stale architecture prose in `arch-rendering.ts` (two false claims about `ReaderShell`/`ChapterSheet` still rendering outline chapters) and, caught as an intent gap in this plan's own Code Map, the same staleness in `arch-content-model.ts` and `arch-build.ts`; the now-dead `ChapterSheet.tsx` deleted; the now-dead old skeleton CSS in `globals.css` deleted; a self-reference guard added to `relatedTopicId()`; a missing e2e assertion for the "Not written yet." status text added. 1 low finding deferred: no automated throttle/CLS test proves "no layout jump" directly — the mechanism (shared grid classes across the skeleton and both reader variants) was independently confirmed structurally by one of the review lenses, and no throttle/CLS test infrastructure exists anywhere in the repo to extend. 2 low findings rejected: redundant `noindex` re-assertion (already covered generically by the untouched `tests/seo.test.ts`); a prev/next edge case for a topic partially converted from outline to written, confirmed unreachable since no topic today mixes ready and not-ready chapters. 5 findings rejected as false, each independently verified: the empty-syllabus-items fallback is copied verbatim from the pre-existing `ChapterSheet.tsx`, not a new risk; `RELATED_TOPIC`'s default-to-`js` for unlisted topics is this plan's own documented assumption; "Meanwhile" linking to a related topic's cover rather than a specific chapter matches both this plan's Boundaries and topics.md's own worked examples; "entry 6 reuses `lib/topicRelated.ts`" is an unverifiable forward-looking claim, not a defect.

**Follow-up review recommended:** `true`. Two distinct medium-severity entries were patched (both architecture-prose groups). The specific unverified risk: this patch round's own new code — the `relatedTopicId()` self-reference guard and the deletion of `ChapterSheet.tsx`/its CSS — has not itself been through a review pass.

**Verification:** `npm run check` passes (19 files, 335 unit tests; the same pre-existing, unrelated `useReadingPlan.ts` lint warning from TP-2 persists, non-blocking). `npm run build` passes, all 18 topics' routes statically generated. `npm run test:e2e` at `--workers=3`: 177/180 (the 3 known pre-existing `/notes/setup-mental-model`/`/notes/basic-async` contrast/focus failures persist identically, consistent across every story this session).

**Residual risks:**
- No automated layout-jump/CLS check exists; the fix is structurally sound (confirmed by matching DOM/grid classes) but unverified by a dedicated visual-regression test.
- `RELATED_TOPIC`'s "Meanwhile" partner is a documented default (10 of 14 outline topics fall back to `js` with no topical relation) rather than a curated choice per topic — acceptable per this plan's own scoping, but a future pass could make each outline topic's "Meanwhile" link more specific.
