---
title: 'Language switch and per-language chapter code (tracer)'
type: 'feature'
ticket: '6'
created: '2026-10-07'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/specs/spec-dsa-mastery/code-languages.md']
warnings: ['oversized']
deferred:
  - summary: >-
      No test runs the translations: the syntax test shows each parses, not that Python, Java and C++ behave like the JavaScript.
    evidence: |-
      Translations were reviewed by hand for this tracer (same loops, overflow-safe arithmetic). A parity test needs a Python, Java and C++ toolchain in CI or a table of cases run through the Playground runtimes; decide when the level epics add many more blocks.
    location: >-
      content/dsa/code/**, tests/dsa-code-languages.test.ts
    severity: low
  - summary: >-
      The cross-tab `storage` listener of the language store has no test.
    evidence: |-
      A second-context e2e or a store unit test would cover it; the effect is two open tabs showing different languages until reload.
    location: >-
      lib/codeLanguage.ts
    severity: low
  - summary: >-
      The unit-test totals in the architecture chapters are stale and asserted nowhere (same item as stories 1.2, 1.3, 1.4).
    evidence: |-
      Vitest runs 419 tests in 28 files; derive and assert the figure in the frame sweep.
    location: >-
      content/architecture/arch-testing.ts, arch-health.ts
    severity: low
baseline_revision: 'bdd046499b4b3f7e5b1b7d9369b03b08cf24d11a'
---

<intent-contract>

## Intent

**Problem:** A DSA chapter's code blocks exist only in JavaScript. Readers who think in Python, Java or C++ cannot see the same example in their language, and nothing remembers a language choice.

**Approach:** Add a four-way language switch (JavaScript, Python, Java, C++) to DSA chapters that hold code blocks marked `data-code`. JavaScript stays authored inside the chapter body as the default and the server-rendered first state; Python, Java and C++ are authored files loaded lazily, one language at a time, only when the reader picks that language. The choice persists in its own key. Prove it end to end on all three code blocks of `dsa-binary-search` and one code block of `dsa-two-pointers` (so the choice visibly carries to a second chapter), with completeness and syntax tests that really fail on a missing translation or a syntax error.

## Boundaries & Constraints

**Always:** A chapter code block is `<div data-code="<block-id>"><pre><code>…JavaScript…</code></pre></div>`; the JavaScript inside stays exactly the chapter's code and is what the server renders and what is shown by default. Block ids are unique within a chapter. Translations live in `content/dsa/code/<chapter-id>/<language>.ts` (`python`, `java`, `cpp`), each `export const code: Record<string, string>` mapping block id to the HTML that goes inside `<code>` (comments in `<span class="c">…</span>` like the JavaScript, no other markup); the structure, variable names and comments match the JavaScript as closely as each language allows. They are authored, never generated at runtime, and each behaves the same as the JavaScript. The language lives in `groundwork:dsa:lang` (versioned, own store with a snapshot cache and a `storage` event listener, following `lib/interviewConfidence.ts`), default `javascript`; it never writes a `jsnotes:*` key and never touches the global level. Only the chosen language's module is fetched (dynamic import after mount, cached); JavaScript fetches nothing. Switching only rewrites the `<code>` of `[data-code]` blocks: it never reloads the page and never touches the Player, a puzzle or a check. The switch is a labelled group of four buttons with `aria-pressed`, keyboard operable, with a visible "Code: <language>" text and a `role="status"` line announcing "Code shown in <language>" after a change; it shows only on chapters that have `data-code` blocks (so no other topic shows it). Tests: completeness (every `data-code` id of every chapter has all three translations, non-empty, no extra ids) and syntax (the JavaScript block and each translation parse without Lezer error nodes after tags are stripped and entities decoded, using the editor's JavaScript, Python, Java and C++ grammars), and each has a negative fixture proving it fails (a removed translation; a syntax error for each of the four grammars). Style with theme tokens in `components/topic/reader.module.css`; add no CSS module. Update the How this is built chapters that list storage keys and describe the reader, and keep asserted counts true. No comments in source.

**Never:** Do not change the Player, tracers, puzzles, checks, exercises, the Playground, check-question code, other topics, or any chapter's code other than the four blocks named. Do not import `content/dsa/code/*` statically from any client file (dynamic import only; `tests/client-bundle.test.ts` must stay green). Do not machine-translate at build or run time. Do not edit the spec files.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First visit | no `groundwork:dsa:lang` key | JavaScript pressed, the chapter's JavaScript shown, no extra request | none |
| Switch | click Python, then Java, C++, JavaScript | each `[data-code]` block shows that language's code; JavaScript restores the original | a missing translation leaves the JavaScript and the test fails |
| Persist | reload, or open `/dsa/dsa-two-pointers` | the choice holds, shown on the second chapter | none |
| Stale value | `groundwork:dsa:lang` holds an unknown language | treated as `javascript` | none |
| Other topic | `/notes/closures` | no switch, no `groundwork:dsa:lang` read | none |
| Keyboard | Tab to the switch, Enter or Space on a language | changes, status line announces it | none |

</intent-contract>

## Code Map

- `lib/codeLanguage.ts` (new, client) -- `CodeLanguage` type, `CODE_LANGUAGES` with labels (JavaScript, Python, Java, C++), the store and `useCodeLanguage()` returning `[language, setLanguage]` via `useSyncExternalStore`; server snapshot `javascript`. Pattern: `lib/interviewConfidence.ts:1-40` (key, listeners, cached raw, `storage` event) and `store` from `lib/storage`.
- `components/dsa/CodeLanguageSwitch.tsx` (new, client) -- the button group and the status line; styles in `components/topic/reader.module.css` (existing module).
- `components/reader/codeLanguages.ts` (new, client-safe) -- `applyCodeLanguage(container, chapterId, language)`: for each `[data-code]` element, keep the original JavaScript `<code>` HTML in a `data-` attribute or WeakMap on first change, then set the `<code>` innerHTML from the lazily imported `@/content/dsa/code/${chapterId}/${language}` module (cached per chapter and language), or restore the JavaScript; set `data-lang` on the block. Dynamic `import()` with a template path, so each language file is its own chunk.
- `components/topic/TopicReader.tsx:91-105,189-205,218-246` -- new optional prop `codeBlocks?: boolean`; when true mount a small client binding (switch in the article header meta row beside the Listen chip, and an effect keyed on `[chapter.id, language]` calling `applyCodeLanguage` on the same `bodyRef` after the enhancers have run). Must not run `enhanceCodeBlocks` again on swap: the copy button reads `pre.innerText` at click time, so it follows the swap.
- `components/reader/topicPages.tsx:155-195` -- pass `codeBlocks` when the chapter body contains `data-code="`.
- `content/dsa/dsa-binary-search.ts:65,108,132` -- wrap the three `<pre>` blocks as `data-code` blocks with ids `binary-search-classic`, `answer-search-bananas`, `lower-bound`; keep the JavaScript byte for byte.
- `content/dsa/dsa-two-pointers.ts` -- wrap its first `<pre>` block as a `data-code` block (pick a short id such as `two-pointers-opposite-ends`); translate that one block only.
- `content/dsa/code/dsa-binary-search/{python,java,cpp}.ts` and `content/dsa/code/dsa-two-pointers/{python,java,cpp}.ts` (new) -- the authored translations (Python `def`, Java methods with `int[]`, C++ functions with `vector<int>&` and `#include` lines only if the block needs them; keep each block a self-contained function).
- `lib/dsaCode.ts` (new, server/test only, not imported by client code) and `tests/dsa-code-languages.test.ts` (new) -- the completeness and syntax checks. Lezer grammars come from `@codemirror/lang-javascript`, `lang-python`, `lang-java`, `lang-cpp` (`<x>Language.parser.parse(source)`, walk the tree for `node.type.isError`); if one cannot run under Vitest, fall back to the cheaper equivalent check the spec allows (balanced brackets and quotes plus a keyword check) and record that in Implementation Notes. Include negative fixtures: a chapter missing one translation, and one syntax-error snippet per grammar.
- `e2e/smoke.spec.ts` -- new tests: (1) first visit shows JavaScript pressed and the JavaScript code, the server HTML lacks the Python, Java and C++ translations; (2) on `/dsa/dsa-binary-search` clicking Python, Java, C++ and JavaScript changes the three blocks (assert a distinctive token per language), the `role=status` line reads `Code shown in <language>`, a reload keeps the choice, `/dsa/dsa-two-pointers` shows it too, no `jsnotes:*` key appears or changes (`jsnotes:level` and the key set before and after), and the switch works by keyboard; (3) `/notes/closures` has no switch. `e2e/a11y.spec.ts` already visits `/dsa/dsa-binary-search` (axe in nine themes covers the switch).
- `content/architecture/arch-state.ts`, `arch-rendering.ts`, `tests/claims.test.ts` -- list `groundwork:dsa:lang`, describe the `data-code` path in a sentence or two, keep asserted counts (browser tests, spec counts) true.

## Tasks & Acceptance

**Execution:**
- [x] `lib/codeLanguage.ts`, `components/dsa/CodeLanguageSwitch.tsx`, `components/reader/codeLanguages.ts`, `reader.module.css` -- the store, switch and swap -- one language at a time, lazily
- [x] `components/topic/TopicReader.tsx`, `components/reader/topicPages.tsx` -- mount the switch and the effect only when a chapter has `data-code` blocks -- other topics untouched
- [x] `content/dsa/dsa-binary-search.ts`, `dsa-two-pointers.ts`, `content/dsa/code/**` -- the placeholders and the authored translations -- the proof content
- [x] `lib/dsaCode.ts`, `tests/dsa-code-languages.test.ts` -- completeness and syntax tests with negative fixtures -- they really fail
- [x] `e2e/smoke.spec.ts`, `content/architecture/*`, claims -- end-to-end proof and true prose and counts

**Acceptance Criteria:**
- Given `/dsa/dsa-binary-search` with no stored choice, then JavaScript is pressed, the JavaScript code shows and the server HTML holds no Python, Java or C++ translation.
- Given the switch, when Python, Java, C++ and JavaScript are chosen in turn, then all three blocks change each time, the status line announces it, and the choice survives a reload and shows on `/dsa/dsa-two-pointers`.
- Given a non-DSA chapter, then no switch renders, and no `jsnotes:*` key or the global level changes anywhere.
- Given the tests, then they fail when a translation is removed and when a syntax error is put in a fixture for each of the four grammars, and pass on the real files.
- Given `npm run check`, `npm run build` and the full `npm run test:e2e`, then all pass (axe included).

## Implementation Notes

- Review decisions: a failed or missing translation restores the block's JavaScript and the status line says so; the choice stays in memory if storage fails; the switch buttons are at least 24px; the lower-bound JavaScript comment gained a `//` on its continuation line (a real bug in the chapter that the syntax test exposed), the only change to the JavaScript. Spec `code-languages.md` was updated after this story to describe per-language files.

- All four Lezer grammars run under Vitest, so the bracket-and-keyword fallback was not needed.
- The Java grammar rejects a bare method, so `syntaxErrors` wraps Java source in `class Snippet { ... }` before parsing; the translation files stay bare methods.
- The `lower-bound` JavaScript comment continued on a second line without `//` (a real syntax error once the span tags are stripped). The continuation line now starts with `//`; no other JavaScript byte changed.
- Translation files hold HTML-escaped code (`&lt;`, `&gt;`, `&amp;`) because C++ `vector<int>` would otherwise parse as an element; the test checks no markup other than comment spans.
- Java `answer-search-bananas` uses a helper method (Java has no nested functions) and a loop for the maximum, so no imports are needed.

## Plan Change Log

## Review Triage Log

### 2026-10-08 — Review pass
- verdicts: 27 findings — high 0, medium 1, low 25, false 1, maybe-false 0
- findings:
  - `[low]` `[reject]` blind-hunter: C++ `minEatingSpeed` on an empty `piles` is undefined while JavaScript, Python and Java differ — the problem's constraint is a non-empty array
  - `[low]` `[reject]` blind-hunter: `h` and `speed` edge cases are not covered — positive inputs by the problem's constraints
  - `[low]` `[defer]` blind-hunter/gap: no test runs the translations — deferred with the toolchain question
  - `[low]` `[reject]` blind-hunter: two-pointers `sum` widening differs from JavaScript doubles — equal for normal inputs
  - `[low]` `[reject]` blind-hunter: comments are reworded and indented differently — meaning matches; the Python comment names the language-specific reason
  - `[low]` `[reject]` blind-hunter: Java translations are bare static methods — chapter snippets are fragments, like the JavaScript ones
  - `[medium]` `[patch]` blind-hunter/edge: a failed or missing translation is cached forever, leaves the previous language's code and is announced as success — retries, restores JavaScript, announces after success
  - `[low]` `[patch]` blind-hunter: the "no extra request" check only asserts growth — now exact deltas per language
  - `[low]` `[defer]` blind-hunter/edge/gap: unit-test totals stale — frame sweep
  - `[false]` `[reject]` blind-hunter: the plan is unfinished and the spec still says one file per chapter — closed out here; the spec companion was updated
  - `[low]` `[patch]` blind-hunter: switch buttons under 24px — min size added
  - `[low]` `[reject]` blind-hunter: the height changes when the language changes — no layout shift worth a min-height here
  - `[low]` `[reject]` blind-hunter/edge: fragile marker parsing and five-entity decoding — the tests cover every marked chapter and fail loudly on a malformed block
  - `[low]` `[patch]` edge-case-hunter: the announcement fires before the import resolves — after the swap
  - `[low]` `[patch]` edge-case-hunter: a storage write failure makes the click do nothing — in-memory fallback
  - `[low]` `[reject]` edge-case-hunter: a null-key storage event on `clear()` — the in-memory value clears on a key event; a full clear in another tab is rare
  - `[low]` `[reject]` edge-case-hunter: the body re-enhancing could revert translations — enhancers run once per chapter
  - `[low]` `[reject]` edge-case-hunter: non-ready chapter folders and stray files — the test iterates marked chapters
  - `[low]` `[reject]` edge-case-hunter: raw `<` in JavaScript could parse as a tag — the syntax test fails if it does
  - `[low]` `[patch]` verification-gap: a late import resolving after a newer choice is untested — a delayed-chunk e2e
  - `[low]` `[patch]` verification-gap: the copy button after a swap is unverified — a clipboard e2e
  - `[low]` `[defer]` verification-gap: the cross-tab listener is untested — deferred
  - `[low]` `[reject]` intent-alignment: a visitor with a stored non-JavaScript language sees JavaScript first, then the swap — inherent to a server-rendered default
  - `[low]` `[reject]` intent-alignment: per-language files differ from the spec's single file — deliberate; the spec companion now says so
  - `[low]` `[reject]` intent-alignment: axe is not run on the switch — `e2e/a11y.spec.ts` already visits `/dsa/dsa-binary-search` in nine themes, and it passes with the switch on the page
  - `[low]` `[reject]` intent-alignment: the tests prove the checkers can fail, not the real files — the implementer also removed a real translation and broke a real file once and saw them fail

## Design Notes

JavaScript stays in the chapter body because the chapter's prose is written against it and the server must render a real first state; only the other three languages need a lazy file. Per-language files (not one file per chapter) are what lets "only the chosen language loads" hold; `code-languages.md` says one file per chapter, which this story supersedes and a later spec update records.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: green
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` then `npm run test:e2e` -- expected: all pass

**Manual checks (if no CLI):**
- On a throwaway port (not 3000), `/dsa/dsa-binary-search` at 1440 and 390 in each language with reduced motion; the switch reads clearly and the code blocks keep their look and comment colouring.

## Auto Run Result

**Summary:** A four-way language switch (JavaScript, Python, Java, C++) now sits in the header of DSA chapters that hold `data-code` blocks. JavaScript stays in the chapter body as the default and the server-rendered first state; the other three languages are authored files loaded lazily, one at a time; the choice persists in `groundwork:dsa:lang`. Proven on the three code blocks of `dsa-binary-search` and one of `dsa-two-pointers`. Completeness and Lezer syntax tests (all four grammars) have negative fixtures. A failed load restores JavaScript and says so.

**Files changed:** `lib/codeLanguage.ts`, `lib/dsaCode.ts`, `components/dsa/CodeLanguageSwitch.tsx`, `components/reader/codeLanguages.ts`, `components/topic/TopicReader.tsx`, `components/reader/topicPages.tsx`, `components/topic/reader.module.css`, `content/dsa/dsa-binary-search.ts`, `dsa-two-pointers.ts`, six files under `content/dsa/code/`, `tests/dsa-code-languages.test.ts`, `e2e/smoke.spec.ts`, and the architecture chapters that list the key and the counts.

**Review:** 27 findings: medium 1, low 25, false 1. Patched 7 (load failure handling and announcement, in-memory fallback, 24px targets, a delayed-chunk test, a clipboard test, exact request deltas), deferred 3 low (translation parity test, cross-tab listener test, stale unit-test totals), rejected the rest with reasons logged above.

**Follow-up review recommended:** false.

**Verification:** `npm run check` 419 unit tests, build ok, full `npm run test:e2e` 200/200 including axe in nine themes; screenshots of the switch and a swapped block at 1440 and 390 with no horizontal scroll.

**Residual risks:** a Vitest warning about the template-literal dynamic import (harmless); only two chapters have translations until the level epics add the rest.
