---
title: 'Stale copy, round 2'
type: 'bugfix'
ticket: '4'
created: '2026-10-01'
status: 'built'
route: 'oneshot'
route_source: 'auto'
review: 'quick'
review_source: 'auto'
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md']
warnings: []
deferred: []
baseline_revision: 'fc89653348eb19747e4be55620608e300c7a7c15'
---

<intent-contract>

## Intent

**Problem:** Three numbers are stale: the JavaScript tagline says 40 sections when there are 41; the README and the Playground's page description say 4 languages when 11 run and 17 are known; and `docs/ROADMAP.md`'s "Measured today" line and table understate how much is written (194 chapters, Git 16, How this is built 18) against the current 227, 18 and 26.

**Approach:** Fix each number at its source, derive what can be derived, and extend `tests/claims.test.ts` so the tagline and language counts can't go stale silently again. `docs/ROADMAP.md` is a manually-maintained planning document, not under `content/architecture/`, so its refresh is a direct edit, verified by reading it rather than by a new automated test.

## Boundaries & Constraints

**Always:**
- `content/topics.ts`'s JS tagline states the true chapter count for `js`, taken from `chapters("js").length`.
- README.md's Playground row and `app/practice/page.tsx`'s metadata description name the languages that actually run, matching `LANG_ORDER`/`LANGUAGES` (`runnable` entries): JavaScript, TypeScript, Python, SQL, HTML, CSS, C++, C, Ruby, PHP, Lua — 11 run, 17 known in total, in the same voice as the home FAQ's existing phrasing (`app/HomeView.tsx:779`).
- `tests/claims.test.ts` asserts the new tagline and language-count claims, deriving the expected numbers the same way `chapters`/`LANG_ORDER` already do elsewhere in that file.
- `docs/ROADMAP.md`'s "Measured today" sentence and its table: the overall written-chapter count becomes 227 (`siteStats().writtenChapters`), the "How this is built" row becomes 26, and the "Git" row becomes 18. The "358 still outlines" figure and every per-topic exercise count are already correct and stay as they are.
- The fourteen-outline sizes stay at their current content sizes — GraphQL 22, Redis 21, Kubernetes 24 (`chapters(topicId).length` today) — not the resized ~6/~12/~8 that section 0.2's market research proposes. That resize is a future curriculum decision requiring rewritten outline files; this story only makes the document match the content as it stands.
- No comments. Append-only `.cspell/project-words.txt` if a new word is needed (none expected).

**Never:**
- Do not touch the `/soon` copy (epic 2 entry 2) or the interview-question count (entry 8).
- Do not change any outline's syllabus, section count or content.
- Do not add a vitest assertion for `docs/ROADMAP.md`; it is a planning document outside `content/architecture/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| JS tagline | `content/topics.ts`'s `js` tagline | Reads "41 sections deep" | `tests/claims.test.ts` fails if it drifts from `chapters("js").length` |
| README Playground row | README.md | Names the 11 languages that run, not 4 | Claims test checks the row contains the current runnable count |
| Practice page description | `app/practice/page.tsx` metadata | States the same current language count | Claims test checks the description contains it |
| ROADMAP written count | `docs/ROADMAP.md` | "227 chapters written" in the Measured-today sentence | Manual read against `siteStats()` |
| ROADMAP table rows | `docs/ROADMAP.md` | How this is built 26, Git 18 | Manual read against `topicStats()` |
| ROADMAP outline sizes | `docs/ROADMAP.md` | GraphQL/Redis/Kubernetes stay 22/21/24 | Manual read against `chapters(topicId).length` |

</intent-contract>

## Code Map

- `content/topics.ts:506`: `tagline: "The whole map, 40 sections deep"` → 41. `content/notes.ts:48` already says 41 and needs no change.
- `README.md:16`: the Playground row's `A CodeMirror editor running JavaScript, TypeScript, Python (Pyodide) and SQL (sql.js) entirely in the browser` names only 4 languages. Reword to name the 11 that run (JavaScript, TypeScript, Python, SQL, HTML, CSS, C++, C, Ruby, PHP, Lua), in the voice of the surrounding table.
- `app/practice/page.tsx:7`: `description: "Write JavaScript, TypeScript, Python or SQL in the browser, run it, and check it against real tests."` — same fix, kept short enough for a meta description.
- `lib/codeLanguages.ts`: `LANG_ORDER` (17 entries) and `LANGUAGES[key].runnable` are the source of truth; 11 entries have a non-null `runnable`. `app/HomeView.tsx:758,779` already derives its copy this way — match that pattern when writing the new claims cases.
- `tests/claims.test.ts`: follow the existing `cases`/`it.each` pattern (e.g. the README interview-rounds case at line ~68). Add:
  - a case for `content/topics.ts` asserting the tagline contains `` `${chapters("js").length} sections deep` ``;
  - a case for `README.md` asserting the Playground row names the current runnable count;
  - a case for `app/practice/page.tsx` asserting its description names the current runnable count.
  Derive the runnable count the same way `app/HomeView.tsx` does (filter `LANG_ORDER` by `LANGUAGES[key].runnable`), imported from `lib/codeLanguages`.
- `docs/ROADMAP.md`:
  - Line 16: `Measured today: **7 of 21 topics are written** — 194 chapters written, 358 still outlines, plus` → 194 becomes 227.
  - The table a few lines below: `| How this is built | 18 | — | 7k | — |` → 26; `| Git | 16 | **0** | — | yes |` → 18. Leave every other row (JavaScript 41, React 57, DSA 34, System Design 24, Interview book 27 rounds) and all exercise/word columns unchanged — they are already correct.
  - Lines 33-35 (the fourteen-outline sizes, including GraphQL 22, Redis 21, Kubernetes 24) are already correct; no change.
- Verified by direct computation against the live content (`lib/content.ts`'s `chapters`/`topics`, `lib/topicStats.ts`'s `siteStats`/`topicStats`): `siteStats()` gives `{ writtenChapters: 227, exercises: 538, minutes: 2448, topics: 19 }`; `topicStats()` gives `architecture: { written: 26 }` and `git: { written: 18 }`; `chapters("graphql"|"redis"|"kubernetes").length` gives 22/21/24.

## Tasks & Acceptance

**Execution:**
- [ ] `content/topics.ts` -- 41 sections -- tagline
- [ ] `README.md`, `app/practice/page.tsx` -- the 11 languages that run -- C8
- [ ] `tests/claims.test.ts` -- cases for the tagline and both language-count claims -- guard
- [ ] `docs/ROADMAP.md` -- 227 written, How this is built 26, Git 18 -- refresh

**Acceptance Criteria:**
- Given `tests/claims.test.ts`, when it runs, then it asserts the JS tagline's chapter count and both language-count claims, and passes.
- Given `docs/ROADMAP.md`, when read, then its Measured-today sentence and table state 227 written chapters, How this is built at 26 and Git at 18, with every other figure unchanged.

## Implementation Notes

## Plan Change Log

## Review Triage Log

### 2026-10-01 — Review pass
- verdicts: 1 finding — high 0, medium 1, low 0, false 0, maybe-false 0
- findings:
  - `[medium]` `[patch]` README's "with 6 more known for syntax highlighting" clause was a new hardcoded number, unguarded by the claims test, which undercut this story's own goal of making these counts self-checking — the claims case now covers the whole sentence, deriving the "more known" count from `LANG_ORDER.length - runnableCount`.

## Design Notes

The ticket's open question — whether `docs/ROADMAP.md` should state the fourteen outlines' current sizes (22, 21, 24 for GraphQL, Redis, Kubernetes) or the resized targets (~6, ~12, ~8) from section 0.2's market research — is resolved by checking the content directly: `chapters("graphql"|"redis"|"kubernetes").length` is 22, 21 and 24 today, matching what the document already states. The resized figures are a proposed future curriculum change (fold GraphQL into Node, shrink Kubernetes and Redis), not yet made to any outline file, and this story's scope is to make stale copy match the content as it stands, not to rewrite curricula. So no change is needed there.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.

## Auto Run Result

**Summary:** The JavaScript tagline, the README and Playground-page language counts, and three `docs/ROADMAP.md` figures are refreshed to match the content. `tests/claims.test.ts` now derives and asserts the tagline and both language-count claims, so they can't go stale silently again.

**Files changed:**
- `content/topics.ts`: the JS tagline, 40 → 41 sections.
- `README.md`: the Playground row names the 11 languages that run and the 6 more known, instead of 4.
- `app/practice/page.tsx`: the metadata description, same fix in meta-description length.
- `tests/claims.test.ts`: three new cases (tagline, README language count, practice-page language count), derived from `chapters("js")` and `lib/codeLanguages`'s `LANG_ORDER`/`LANGUAGES`.
- `docs/ROADMAP.md`: the Measured-today sentence (194 → 227 chapters written, restructured to avoid double-counting Git's sections) and the table's How this is built (18 → 26) and Git (16 → 18) rows. The fourteen-outline sizes, including GraphQL/Redis/Kubernetes, were confirmed to already match the content (22/21/24) and were left unchanged — see Design Notes for how that resolved the ticket's open question.

**Review findings:** 1 finding (medium), patched: the README's "6 more known" clause was a new hardcoded number with no test guarding it; the claims case now covers the whole sentence.

**Verification:** `npm run check` passes (19 files, 312 unit tests, up from 309).

**Residual risks:** None beyond what the plan's Design Notes already flag — the fourteen outlines' sizes stay as planned (22/21/24 for GraphQL/Redis/Kubernetes) until a future story actually rewrites those curricula to the resized targets section 0.2 proposes.
