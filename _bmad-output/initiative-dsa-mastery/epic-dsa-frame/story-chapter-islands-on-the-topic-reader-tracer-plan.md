---
title: 'Chapter islands on the topic reader (tracer)'
type: 'feature'
ticket: '1'
created: '2026-10-07'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/specs/spec-dsa-mastery/play-catalog.md']
warnings: []
deferred: []
baseline_revision: '1f749ff058d6538bea3148ec3ebda8099e1bd1e6'
---

<intent-contract>

## Intent

**Problem:** A DSA chapter body is one HTML string, so nothing can plug a player, puzzle or check into the middle of a chapter. The reader's enhancers, narration and smooth scrolling treat everything in the body as prose to enhance.

**Approach:** Let a chapter mark a place with `<div data-play="binary-search"></div>`. A pure server step splits the body at such placeholders into HTML segments and islands. The topic reader renders segments when a chapter has islands, and a server-rendered stub island fills each place. The enhancers, narration, scroll regions and smooth scrolling leave `[data-island]` alone. It is proven on `/dsa/dsa-binary-search`; no other chapter or topic changes.

## Boundaries & Constraints

**Always:** A chapter without a placeholder renders exactly as today (the single HTML string path). The stub is honest: it says the step-by-step player is not built yet and offers no control. It uses theme tokens, adds no new CSS module (put its rules in the existing `components/topic/reader.module.css`), and has no heading so heading order stays valid. Placeholders are block-level and top-level in the body; the split never produces unbalanced HTML. The island carries `data-island`, `data-play`, `data-no-smooth` and `data-speech-exclude`. Keep the old binary-search demo as it is (the player story replaces it). Update the How this is built chapter that describes the reader and any count `tests/claims.test.ts` asserts. No comments in source.

**Never:** Do not change `ChapterView`, `SeriesLanding`, the Git or architecture pages, any other chapter's content, the completion policy, the check, the player or the language switch (other entries). Do not add a client-side player, a registry or any tracer. Do not make other topics' chapters take the segments path.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| One island | body with one `<div data-play="binary-search"></div>` | html, island, html segments in order | none |
| Two islands | two placeholders | three html segments around two islands | none |
| No island | any other chapter | `null`, so the reader uses the string path | none |
| Unsafe id | `data-play="a b"` or with quotes | left as plain HTML, not an island | none |
| Nested placeholder | placeholder inside `<p>` or another block | never split (would unbalance HTML); a unit test over every chapter fails if one exists | test fails loudly |
| Enhancers | `pre` or `table` outside an island | enhanced as before; nothing inside `[data-island]` is touched | none |

</intent-contract>

## Code Map

- `components/topic/TopicReader.tsx:218-224` -- renders `<div id="chapters" ref={bodyRef} className={styles.content} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />`; the effect at 91-105 runs `activateScripts`, `enhanceCodeBlocks`, `enhanceTables`, `enhanceTryBlocks`, `markNoSmooth`, `setupNarration(el.parentElement ?? el)` and `makeScrollRegions(el)` over `bodyRef`. Add an optional `segments?: BodySegment[]` prop: when set, render the same `div#chapters` (same ref, class, id) with a child per segment instead of `dangerouslySetInnerHTML`; HTML segments get a wrapper with a `display: contents` class, islands render `PlayIsland`.
- `components/reader/topicPages.tsx:155-195` -- builds `{ html, toc }` with `withHeadingIds(chapter.body)` and passes `html` to `TopicReader`; call the new splitter on `html` and pass `segments` only when it returns non-null.
- `lib/chapterIslands.ts` (new) -- pure: `type BodySegment = { kind: "html"; html: string } | { kind: "island"; id: string; input: string | null }` and `splitIslands(html: string): BodySegment[] | null`. Placeholder grammar: `<div data-play="[a-z0-9-]+"( data-input='[^']*')?></div>`; `null` when there is none.
- `components/play/PlayIsland.tsx` (new, server-safe, no client code) -- the stub: a `section` with the attributes above and `aria-label="Play it"`, a short honest sentence, styled by new `.island` rules in `components/topic/reader.module.css`.
- `components/reader/enhancements.ts:41-111` -- `enhanceCodeBlocks`, `enhanceTables`, `markNoSmooth`, `activateScripts`, `enhanceTryBlocks` all `querySelectorAll` the body: skip nodes with `closest("[data-island]")`.
- `components/reader/narration.ts:3-4` -- `SPEECH_EXCLUDE` already has `[data-speech-exclude]`; add `[data-island]` too so narration skips it by selector as well.
- `components/reader/scrollRegions.ts:68-91` -- `makeScrollRegions` collects `pre`, `.table-scroll`, ...: filter out anything inside `[data-island]`.
- `lib/scrollFx.ts:21` -- smooth scrolling already skips `[data-no-smooth]`; the island carries it.
- `content/dsa/dsa-binary-search.ts` -- add `<div data-play="binary-search"></div>` as a top-level block just before the existing `<div class="demo">` (line ~154); leave the old demo and its script untouched.
- `app/globals.css:2620` -- the print/scroll reveal rule `.chapter > div > .dg` only matches the single-string path; leave it (cosmetic for island chapters) and note it in Implementation Notes.
- `e2e/smoke.spec.ts` -- add a test for `/dsa/dsa-binary-search`; `e2e/a11y.spec.ts` already lists DSA chapters (check `/dsa/dsa-binary-search` is covered or add it).
- `content/architecture/arch-rendering.ts` and the claims test (`tests/claims.test.ts`) -- describe the island path in one or two sentences and keep asserted counts (client files, CSS modules, test counts) true.

## Tasks & Acceptance

**Execution:**
- [x] `lib/chapterIslands.ts`, `tests/chapter-islands.test.ts` -- the pure splitter and its unit tests (one, two, none, unsafe id, order preserved) plus a test over every chapter of every topic that each `data-play` placeholder is top-level and every segment's HTML is balanced -- the split must never break markup
- [x] `components/play/PlayIsland.tsx`, `components/topic/reader.module.css` -- the server-rendered stub island -- first state exists before any JavaScript
- [x] `components/topic/TopicReader.tsx`, `components/reader/topicPages.tsx` -- optional `segments` prop and its use only when a chapter has islands -- other chapters unchanged
- [x] `components/reader/enhancements.ts`, `narration.ts`, `scrollRegions.ts` -- skip `[data-island]` -- the island is left alone
- [x] `content/dsa/dsa-binary-search.ts` -- the placeholder -- the tracer chapter
- [x] `e2e/smoke.spec.ts` (and `e2e/a11y.spec.ts` if needed) -- see Acceptance -- proves it on the real page
- [x] `content/architecture/arch-rendering.ts`, claims-related chapters -- truthful prose and counts

**Acceptance Criteria:**
- Given `/dsa/dsa-binary-search`, when the server HTML is fetched without running JavaScript, then it contains `data-island="play"` and `data-play="binary-search"` and the stub text.
- Given the loaded page, when it hydrates, then the chapter's code blocks have copy buttons and its tables are wrapped as before, and the island has no copy button and is not wrapped.
- Given the island, then it has `data-no-smooth` and `data-speech-exclude`, and narration builds no chunk from inside it.
- Given `/notes/closures`, `/git/merge` and `/architecture/arch-build`, then their pages render exactly as before and their e2e tests pass unchanged.
- Given `npm run check`, `npm run build` and the full `npm run test:e2e`, then all pass (axe included).

## Implementation Notes

- `splitIslands` and `PlayIsland` are new; `TopicReader` takes an optional `segments` prop and the page passes `html=""` with it, since `html` is read only by the two `dangerouslySetInnerHTML` branches. The two branches have different `key`s so a client navigation between an island chapter and a plain one never reuses a mutated node.
- The `.chapter > div > .dg` scroll-reveal rule in `app/globals.css` only matches the single-string path, so diagrams on island chapters lose that reveal; `#chapters` children are no longer direct for HTML segments. Cosmetic, and today only `dsa-binary-search` is affected.
- The stub sits above the old working demo on purpose; the player story (2.1) replaces both, and the stub must not ship in the release.
- `data-input` is parsed into the segment and ignored by the stub; the player story reads it.

## Plan Change Log

## Review Triage Log

### 2026-10-07 — Review pass
- verdicts: 26 findings — high 0, medium 0, low 15, false 11, maybe-false 0
- findings:
  - `[low]` `[patch]` blind-hunter: `a#chapters` swaps between two branches without a key — keys added
  - `[false]` `[reject]` blind-hunter/edge-case: segment wrappers break child selectors — they use `display: contents`; the only affected rule is the cosmetic `.chapter > div > .dg`, recorded in Implementation Notes
  - `[low]` `[reject]` edge-case-hunter: the regex splits inside `<p>`, `<pre>` or `<script>` — the all-chapters unit test (balanced, top-level) is the guard; a runtime balance check would add code for a case authors cannot reach
  - `[low]` `[reject]` edge-case-hunter: `data-input` is parsed but unused — a later entry (2.1) uses it
  - `[false]` `[reject]` edge-case-hunter: `html=""` could confuse other readers of `html` — `html` is read only by the two render branches
  - `[low]` `[patch]` blind-hunter: the test's tag scanner is weak — kept (all chapters pass and code is entity-escaped), but the placeholder check now counts real `data-play` tags against valid islands for every topic
  - `[low]` `[reject]` blind-hunter: the unit-test count stays 307 — it was already stale and is not asserted; left for the frame sweep (1.5)
  - `[low]` `[patch]` blind-hunter: "six chapters" in `arch-design-system.ts` — the count was dropped from the sentence
  - `[low]` `[reject]` blind-hunter: the plan's Implementation Notes were empty — written at Finalize
  - `[false]` `[reject]` blind-hunter: `markNoSmooth` and `activateScripts` guards are redundant — they protect a future island holding scripts or demos
  - `[low]` `[defer]` verification-gap: nothing asserts the enhancer, scroll-region and narration guards act on island content — the stub has no `pre`, `table` or `.try`; the player story adds the first real content and its test
  - `[low]` `[reject]` verification-gap: the island is a named landmark with a repeated label — axe passes in all nine themes
  - `[low]` `[reject]` verification-gap/intent-alignment: no unchanged-path test for other chapters — the full e2e (191) passes unchanged
  - `[false]` `[reject]` intent-alignment: no 390px check — screenshots at 1440 and 390 taken, no horizontal scroll
  - `[false]` `[reject]` intent-alignment: narration skipping is by construction — both `data-speech-exclude` and `[data-island]` exclude it
  - `[false]` `[reject]` intent-alignment: the old demo's script inside a segment — it is activated as before and the e2e passes

## Design Notes

The splitter is regex based on purpose: the grammar is fixed and authored, so a placeholder is one exact string. A top-level and balance test over all chapters is what keeps authors from nesting one.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: green
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` then `npm run test:e2e` -- expected: all pass

**Manual checks (if no CLI):**
- Screenshot `/dsa/dsa-binary-search` at 1440 and 390 on a throwaway port (not 3000) with reduced motion; the stub reads clearly, the surrounding chapter looks unchanged.

## Auto Run Result

**Summary:** A DSA chapter can hold `<div data-play="id"></div>` placeholders. A pure server step splits the body into HTML segments and islands; the topic reader renders segments only for such chapters; a server-rendered stub island fills each place; the shared enhancers, scroll regions, narration and smooth scrolling leave `[data-island]` alone. Proven on `/dsa/dsa-binary-search`; every other chapter and topic renders as before.

**Files changed:** `lib/chapterIslands.ts`, `components/play/PlayIsland.tsx`, `components/topic/TopicReader.tsx`, `components/topic/reader.module.css`, `components/reader/topicPages.tsx`, `components/reader/enhancements.ts`, `narration.ts`, `scrollRegions.ts`, `content/dsa/dsa-binary-search.ts`, `tests/chapter-islands.test.ts`, `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `content/architecture/arch-rendering.ts`, `arch-testing.ts`, `arch-health.ts`, `arch-design-system.ts`.

**Review:** 26 findings: low 15, false 11. Patched 3 (keys on the two branches, a stricter placeholder test, a count removed from prose), deferred 1 (guard tests wait for real island content), rejected the rest with reasons logged above.

**Follow-up review recommended:** false.

**Verification:** `npm run check` 360/360 unit tests, `npm run build` ok, full `npm run test:e2e` 191/191 including axe; screenshots of the stub at 1440 and 390 with no horizontal scroll.

**Residual risks:** the stub shows above the old demo until story 2.1; diagrams on island chapters lose the cosmetic scroll-reveal.
