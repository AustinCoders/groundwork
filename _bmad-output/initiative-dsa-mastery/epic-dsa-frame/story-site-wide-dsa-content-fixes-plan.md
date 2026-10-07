---
title: 'Site-wide DSA content fixes'
type: 'bugfix'
ticket: '4'
created: '2026-10-07'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/specs/spec-dsa-mastery/curriculum.md']
warnings: []
deferred: []
baseline_revision: '53623481e8315f56e4d501f765e7dc9d5d5602dc'
---

<intent-contract>

## Intent

**Problem:** Three things are wrong across the site's content layer. Reading time counts the words inside `<script>`, `<pre>` and `<svg>`, so code-heavy chapters read as much longer than their prose. The interview book states DSA counts ("34 chapters and 245 exercises") as literals that were already wrong (there are 277 exercises) and will drift again. The string-algorithms chapter uses a literal NUL character as a separator, which browsers drop, so its Z-algorithm example returns `[1]` instead of `[0,2]`.

**Approach:** Make the shared reading-time function count prose only, for every topic. Derive the interview book's DSA chapter and exercise counts from the data and assert them in the claims test. Replace the NUL separators with a visible one and add a test that no content file holds U+0000, plus a test that the chapter's `zSearch` example gives the right answer.

## Boundaries & Constraints

**Always:** `minutesFor` keeps its shape (`Math.max(2, Math.round(words / 180))`, outlines read 0); only what counts as a word changes: text inside `<script>`, `<pre>`, `<style>` and `<svg>` elements no longer counts, then tags are stripped as before. This applies to every topic, Git included (`htmlMinutes`). Every number or sentence in the site that states a reading time or a total that changes (`content/architecture/*`, e2e expectations, `tests/claims.test.ts`, README) is updated to stay true. The interview book's counts are derived on the server from `lib/content` at render time, never hard-coded: put placeholders in `content/interview-data.ts` (for example `{{dsa.chapters}}` and `{{dsa.exercises}}`), replace them in one small server-side function used by every page that renders those strings, and keep `lib/interviewContent`/`content/interview-data.ts` free of imports from `lib/content` (a client component must never reach the content layer; `tests/client-bundle.test.ts` fails otherwise). "Chapters" means written chapters (the 8 new ones are outlines until written). The NUL replacement is a visible separator that cannot occur in the algorithm's input alphabet and the chapter's prose explains it; the Z-algorithm example then returns `[0,2]` for `zSearch("abab","ab")`. No comments in source.

**Never:** Do not rewrite chapter prose beyond the separator fix and a one-sentence explanation of it; do not change the player, the check, the curriculum data or the completion policy; do not change `readMinutes` consumers' markup; do not touch other `interview-data.ts` copy.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Reading time | a chapter body with long `<pre>`, `<script>` and `<svg>` | minutes = max(2, round(prose words / 180)) | none |
| Outline | `ready: false` chapter | 0 minutes, as before | none |
| Interview book | the DSA round's two statements | show the real written-chapter and exercise counts (today 34 and 277) | a leftover `{{...}}` token fails a test |
| Z search | `zSearch("abab","ab")` from the chapter's own code | `[0,2]` | none |
| NUL | any content file containing U+0000 | the no-NUL test fails naming the file | test fails |

</intent-contract>

## Code Map

- `lib/content.ts:120-135` -- `minutesFor(body)` strips tags with `/<[^>]*>/g` and counts whitespace-split words (so code, scripts and SVG text count); `htmlMinutes`, `readTime`, `totalTime` build on it. Callers: `lib/topicStats.ts:26,43` (Git uses `htmlMinutes`), `lib/gitSeries.ts:16`, `app/level/[topic]/page.tsx:53`, `lib/content.ts:88-90` (`readMinutes`). Remove `<script>`, `<pre>`, `<style>` and `<svg>` element contents (non-greedy, case-insensitive, multiline) before counting.
- `tests/content.test.ts:112-130` -- the reading-time block (asserts 0 for outlines and a floor for written); extend it.
- `content/dsa/dsa-string-algorithms.ts:331,342,458` -- the three literal NUL characters (raw bytes, so read the file as bytes). Replace with a visible separator (for example `#`), keep the example consistent in code, dry run and prose, and say in one sentence why a separator is needed and that it must not occur in the strings.
- `tests/no-nul.test.ts` (new) -- scans `content/**`, `app/**`, `lib/**` for U+0000 and fails naming the file.
- `tests/dsa-string-algorithms.test.ts` (new) or a block in `tests/content.test.ts` -- extracts the `zSearch` function from the chapter's `<pre>` (decode entities), evaluates it, and asserts `zSearch("abab","ab")` equals `[0,2]` and one more case.
- `content/interview-data.ts:2478,4200` -- "34 chapters and 245 exercises" in two places (the DSA round's post section and a note); replace with placeholders. Find where the interview chapter HTML reaches the page (`lib/interviewBook.ts`, `lib/interviewContent.ts`, `app/interview/[chapter]/page.tsx`, the question bank's data) and add the single server-side substitution there; make sure no client component imports it.
- `tests/claims.test.ts` -- derive written DSA chapters and DSA exercise count from `lib/content` and assert the rendered interview text carries them; assert no `{{` token survives.
- `tests/content.test.ts` (new case) -- the sliding-window chapter's `readMinutes` equals `Math.max(2, Math.round(proseWords / 180))` where prose words are computed independently in the test from the body with `<pre>`, `<script>`, `<style>`, `<svg>` removed.
- `content/architecture/*`, `README.md`, `e2e/*.ts` -- grep for stated reading times and totals ("min read", "hours of reading", "minutes", reading-time sentences in `arch-content-model.ts` and elsewhere) and fix what the new function changes; the UI numbers are derived so most update themselves.

## Tasks & Acceptance

**Execution:**
- [x] `lib/content.ts`, `tests/content.test.ts` -- prose-only reading time and its tests -- honest reading times everywhere
- [x] `content/dsa/dsa-string-algorithms.ts`, `tests/no-nul.test.ts`, the zSearch test -- the visible separator and its guards -- the example works
- [x] `content/interview-data.ts`, the server-side substitution, `tests/claims.test.ts` -- derived counts, asserted -- no more stale numbers
- [x] `content/architecture/*`, `README.md`, e2e files -- every stated reading time or total that moved -- the site describes itself correctly

**Acceptance Criteria:**
- Given any written chapter, then its `readMinutes` equals `max(2, round(prose words / 180))` with code, scripts, styles and SVG excluded; outlines read 0.
- Given the interview book's DSA round, then its two statements show 34 and 277 (the real written-chapter and exercise counts) with no `{{` token left, and the claims test fails if they drift.
- Given the string-algorithms chapter, then no content file holds U+0000 and `zSearch("abab","ab")` from its own code returns `[0,2]`.
- Given `npm run check`, `npm run build` and the full `npm run test:e2e`, then all pass (axe included).

## Implementation Notes

- `minutesFor` drops the contents of `<script>`, `<pre>`, `<style>` and `<svg>` (the plan adds `<style>` to the three the ticket names) and keeps the formula and the floor of 2 minutes. Site totals fell from 2,452 to 2,025 minutes; the home page's "hours of reading" went from 41 to 34. No README or e2e expectation stated a reading time, so only two architecture paragraphs changed (the audit of stated times found nothing else).
- The interview rounds keep their own formula (`lib/interviewBook.ts`, words at 220 a minute, floor 1); they hold no code, and the architecture chapter now says so.
- The interview book's DSA counts are `{{dsa.chapters}}` and `{{dsa.exercises}}` in `content/interview-data.ts`, filled by `lib/interviewCounts.ts` from `topicStats().dsa` (the figures the `/dsa` cover shows) in `bookRounds()` and the search index. Only rounds r7 and s1 carry them; the raw rounds still read as tokens for any consumer that skips those two paths, which today is none.
- The NUL separators became `#`. A `#` in the input makes the chapter's `zSearch` miss hits and `shortestPalindrome` wrong; the prose says so for both and the tests stay on a `#`-free alphabet.
- The two code samples `{{ user, setUser }}` and `{{ github.ref }}` in the interview book are allow-listed in the leftover-token guard.

## Plan Change Log

## Review Triage Log

### 2026-10-07 — Review pass
- verdicts: 24 findings — high 0, medium 1, low 22, false 1, maybe-false 0
- findings:
  - `[medium]` `[patch]` blind-hunter: the separator prose describes the wrong failure — a `#` in the input makes `zSearch` miss hits; the prose and the code comment now say so
  - `[low]` `[patch]` blind-hunter: only `zSearch` states the `#` assumption — `shortestPalindrome` has it too
  - `[low]` `[reject]` blind-hunter: tests never use `#` or an empty pattern — the chapter documents the limit; the tests stay on the intended alphabet, and a test pins the two failure cases and the prose
  - `[low]` `[reject]` blind-hunter/edge: other readers of the raw interview rounds still see the tokens — only r7 and s1 carry them and they reach pages only through `bookRounds()` and the search index; documented
  - `[low]` `[reject]` blind-hunter: the search index fills every topic's bodies — one cheap regex pass at build time
  - `[low]` `[patch]` blind-hunter: the counts re-implement the site's own — `fillCounts` now reads `topicStats().dsa`, the figures the `/dsa` cover shows
  - `[low]` `[reject]` blind-hunter: the interview text says 34 chapters while the track has 42 — the `/dsa` cover also counts written chapters (34); a singular case never occurs
  - `[low]` `[patch]` blind-hunter/edge: the no-NUL test sees only raw bytes — it also walks the loaded data for escaped NULs
  - `[low]` `[patch]` blind-hunter/edge: the reading-time oracle mirrors the implementation and has thin edge cases — now covers every topic's written chapters and Git, and checks open and close tag counts for the four elements
  - `[low]` `[patch]` blind-hunter/gap: "every reading time follows the rule" is untrue for the interview rounds — the sentence says so
  - `[false]` `[reject]` blind-hunter: the plan file is unfinished — closed out at Finalize
  - `[low]` `[patch]` edge-case-hunter: `shortestPalindrome("a#a")` is wrong — caveat added
  - `[low]` `[reject]` edge-case-hunter: `zSearch` with an empty pattern — not a teaching case; the tests exclude it on purpose
  - `[low]` `[patch]` edge-case-hunter: escaped NULs pass the byte scan — as above
  - `[low]` `[reject]` edge-case-hunter: the mock bank and interview chapter bodies read the raw rounds — latent, as above
  - `[low]` `[patch]` edge-case-hunter: unclosed or nested `<pre>` or `<svg>` — the tag-pairing test
  - `[low]` `[patch]` edge-case-hunter: "every written chapter" covered only topics with levels — all topics now
  - `[low]` `[patch]` edge-case-hunter: the leftover-token guard matches only lowercase dotted tokens — now any `{{...}}` with two code samples allow-listed
  - `[low]` `[reject]` intent-alignment: interview rounds have a separate reading-time formula — they hold no code; recorded
  - `[low]` `[reject]` intent-alignment: the claims test derives the counts with the same expression instead of the literals 34 and 277 — removing such literals is the point of the story
  - `[low]` `[reject]` intent-alignment: the `zSearch` check runs the chapter's extracted code, not a browser — it strips NULs as a browser does, and a restored NUL fails it
  - `[low]` `[reject]` intent-alignment: `<style>` is stripped though the ticket names three elements — the plan adds it
  - `[low]` `[reject]` intent-alignment: stated reading times found nowhere beyond two paragraphs — recorded in Implementation Notes

## Design Notes

Placeholders are substituted on the server because the interview data lives in `content/` and must stay free of imports from `lib/content`; the count helper sits beside the page that renders the strings. Reading time is derived everywhere in the UI, so changing one function moves every displayed number; the work is finding the few places that state a number as text.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: green
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` then `npm run test:e2e` -- expected: all pass

**Manual checks (if no CLI):**
- On a throwaway port (not 3000) view `/interview/<the DSA round>` and `/dsa/dsa-string-algorithms` and confirm the counts and the Z example read correctly.

## Auto Run Result

**Summary:** Reading time now counts prose only for every topic (script, pre, style and svg contents no longer count); the interview book's DSA chapter and exercise counts are derived from the same figures the `/dsa` cover shows and asserted in the claims test; the string-algorithms chapter uses a visible `#` separator instead of NUL, with the limit stated, and a test that the chapter's own `zSearch` returns `[0,2]` plus a test that no content file or loaded data holds U+0000.

**Files changed:** `lib/content.ts`, `lib/interviewCounts.ts` (new), `lib/interviewBook.ts`, `lib/searchIndex` caller, `content/interview-data.ts`, `content/dsa/dsa-string-algorithms.ts`, `tests/content.test.ts`, `tests/claims.test.ts`, `tests/no-nul.test.ts`, `tests/dsa-string-algorithms.test.ts`, `content/architecture/arch-build.ts`, `arch-content-model.ts`, `.cspell/project-words.txt`.

**Review:** 24 findings: medium 1, low 22, false 1. Patched 11 (the separator prose, a caveat for `shortestPalindrome`, the NUL test over loaded data, counts from the cover's own source, reading-time tests over every topic with tag pairing, a wider token guard, one prose sentence), rejected the rest with reasons logged above; nothing deferred.

**Follow-up review recommended:** false.

**Verification:** `npm run check` 405 unit tests, build ok, full `npm run test:e2e` 194/194 including axe; the built `/interview/r7` and `/interview/s1` pages show "34 chapters and 277 exercises" with no token left, and the built string-algorithms chapter shows `pattern + "#" + text`.

**Residual risks:** `content/dsa-notes.ts` still hard-codes "42 sections … 34 written, 8 outlined" and `interview-data.ts` hard-codes "24 chapters" for system design; the architecture chapters' unit-test totals stay stale until the frame sweep.
