---
title: 'Player tracer: binary search end to end'
type: 'feature'
ticket: '1'
created: '2026-10-08'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/specs/spec-dsa-mastery/play-catalog.md', '{project-root}/_bmad-output/initiative-dsa-mastery/epic-dsa-play-engine/epic-dsa-play-engine.md']
warnings: ['oversized']
deferred:
  - summary: >-
      The narration live region speaks every step, so Play at Fast (500 ms) can flood a screen reader.
    evidence: |-
      Spec asks for one role=status sentence per step. A quieter mode (announce only on pause, or a polite throttle) needs a decision with the Play button's aria-pressed; revisit in the play sweep (2.7).
    location: >-
      components/play/Player.tsx
    severity: low
  - summary: >-
      The Player does not reset or clamp its index when the frames prop changes or is shorter.
    evidence: |-
      Entry 2.6 (presets, edited input) swaps the frames; key the Player by input or clamp the index there.
    location: >-
      components/play/Player.tsx
    severity: low
  - summary: >-
      No test shows that pausing on unmount clears the timer, and the bundle guard for the tracer is a weaker duplicate of tests/client-bundle.test.ts.
    evidence: |-
      Move the tracer-import check into client-bundle.test.ts and add an unmount e2e or hook test in the play sweep.
    location: >-
      tests/play-binary-search.test.ts
    severity: low
  - summary: >-
      Unit-test totals in the architecture chapters (307 tests, 19 files, 15 test files) are stale and asserted nowhere.
    evidence: |-
      Vitest now runs 472 tests in 29 files; derive and assert the figures in the frame sweep (1.5).
    location: >-
      content/architecture/arch-testing.ts, arch-health.ts, arch-tech-stack.ts, arch-repo-map.ts
    severity: low
baseline_revision: '913d87ab079d681401e1b84b03cf2e71e249957a'
---

<intent-contract>

## Intent

**Problem:** The binary-search chapter shows 1.1's stub where the step-by-step player belongs, and keeps a hand-written inline demo (hard-coded steps, a dead code highlight, a script in the chapter file). There is no tracer model, no registry and no Player, so no other chapter can get a player.

**Approach:** Build the engine's smallest honest slice and prove it on binary search. A tracer is a pure TypeScript function that records every frame once. A lazy registry maps a play id to its tracer. The server `PlayIsland` runs the tracer for the default input and passes the frames to a client `Player` as props, so the tracer is never shipped to the client and the first frame is in the server HTML. The Player has Back, Next, Play/Pause, Reset, speed, a labelled scrubber, scoped keys and one narration sentence per step, and shows the array, the code and the variables in sync. The inline demo and its script leave the chapter file.

## Boundaries & Constraints

**Always:**
- Tracer type in `lib/play/types.ts`: `id`, `title`, `mirrors` (the `data-code` block id of the chapter code it mirrors), `lines` (ordered `{id, text}`, JavaScript only, text equal to the mirrored block line by line with tags stripped and entities decoded), `defaultInput`, `presets` (named inputs), `limit`, `parse(text)` returning `{ok:true,input}` or `{ok:false,message}`, and `run(input)` returning `Frame[]`. A `Frame` holds `line` (a line id: the line just run), `next` (a line id or null), `narration` (one sentence), `vars` (ordered name/value pairs, `null` for not set yet) and `cells` (value, a `state` of `in`, `out`, `mid`, `found` or `none`, and `marks` of `lo`, `hi`, `mid`). Lines are named by id, never by number, so entry 2.9 can retrofit per-language lines.
- Binary search tracer: sorted integer array up to 16 elements plus a target; `parse` rejects non-numbers, unsorted input, an empty array and anything over the limit with a plain message; presets: found in the middle, not in the array, smallest element, single element. The default input is the old demo's `[1,4,9,13,20,27,31,38,45,50]` with target 31. The final frame's narration states the result (index or not found) and names the number of comparisons.
- Registry `lib/play/registry.ts`: one line per play id, each a dynamic `import()` of the tracer module; `loadTracer(id)` resolves to the tracer or null for an unknown id. No client file imports a tracer or the registry statically (`tests/client-bundle.test.ts` stays green).
- `components/play/PlayIsland.tsx` stays a server component with the same wrapper attributes (`data-island="play"`, `data-play`, `data-no-smooth`, `data-speech-exclude`, label "Play it"); it loads the tracer, runs the default input and renders `<Player>` with the frames, the lines and the labels as props. An unknown id renders nothing broken (the existing kicker and a plain sentence).
- `components/play/Player.tsx` (`"use client"`) and `components/play/player.module.css` (theme tokens only, no hex, no white): controls Back, Next, Play/Pause, Reset, speed (Slow, Normal, Fast), and a scrubber `input type=range` labelled "Step n of N" with `aria-valuetext`; Back and Next disable at the ends; Play/Pause label and `aria-pressed` follow the state; Play at the last frame restarts from the first. Keys only while focus is inside the Player: Left/Right step, Space plays and pauses (not when a button or the range has focus and would act on Space), Home/End jump; the handled key calls `preventDefault` and `stopPropagation` so the chapter's own keys (`components/chapter/useChapterKeys.ts`, `lib/shortcuts.ts`) do not also fire. One `role="status"` element carries the current narration (one sentence per step). The views: array (one cell per element, each cell shows its value, a text label of its state and its marks `lo`, `hi`, `mid` as text), code (an `<ol>` of the tracer's lines, the line just run marked with `aria-current="step"` and a visible text marker, the next line marked "next", not a `pre`) and variables (a `dl` of the frame's variables). No state is shown by colour alone. Never autoplays; pauses on unmount, when the tab becomes hidden (`visibilitychange`) and at the last frame; under `prefers-reduced-motion` there are no transitions or animations (stepping stays instant). The first frame renders on the server (no hydration-only content).
- The inline `.demo` block and its `<script>` leave `content/dsa/dsa-binary-search.ts`; the `data-play="binary-search"` placeholder stays and the surrounding prose still reads right. The chapter file has no `<script>`. Leave the shared demo classes in `app/globals.css` (other chapters' demos still use them).
- Players are never exercises: no `/problems`, no `jsnotes:code:`, no storage key in this entry.
- Measure the client payload before and after (production build; the chapter route's HTML size and the sum of the JS chunks it loads) and record both numbers and the decision on the "first frame on the server" unknown in Implementation Notes.
- Update the architecture chapters in the same entry for every count the change moves (CSS modules, `"use client"` files, e2e test counts, vitest totals if asserted, a11y pages and states); `tests/claims.test.ts` must stay green. No comments in source, tests included. Append new spelling words to the end of `.cspell/project-words.txt`.

**Never:** Do not build presets UI, "Try your own input", the table view, predict-next-step, other layouts or per-language code (entries 2.2 to 2.9). Do not port other chapters' demos. Do not touch the check island, the language switch, the completion policy or the curriculum. Do not add a runtime dependency. Do not edit the spec files. Do not ship the tracer to the client.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First paint | `/dsa/dsa-binary-search`, JavaScript off or before hydration | frame 1 is in the HTML: array, code, variables, narration, "Step 1 of N" | none |
| Step by keyboard | focus in the Player, Right ×N, Left, Home, End | frame changes by one, to the first, to the last; code line, `lo`, `hi`, `mid` and narration agree; the page does not scroll or change chapter | at the ends the key does nothing |
| Play | Play, then wait | advances at the chosen speed, stops on the last frame and the button reads Play again | tab hidden or Player unmounted: paused |
| Scrub | arrow keys or drag on the range | the frame follows; the label reads "Step n of N" | none |
| Reset | Reset | frame 1, paused | none |
| Found / not found | default input / not-in-array preset (tracer test) | final frame narration states index / not found | none |
| Over limit | 17 numbers, unsorted, empty, `abc` (tracer test) | `parse` returns `ok:false` with a message | message, no throw |
| Unknown id | `<div data-play="nope">` | the island renders its kicker and a plain sentence | no throw |
| Reduced motion | `prefers-reduced-motion: reduce` | no transitions; the steps still change | none |

</intent-contract>

## Code Map

- `components/play/PlayIsland.tsx` -- server stub today (`PlayIsland({id})`, wrapper attrs, `styles.island` from `components/topic/reader.module.css`); becomes the loader that renders the Player.
- `components/check/CheckIsland.tsx` -- sibling stub; leave alone, mirror its wrapper style.
- `lib/chapterIslands.ts` -- `splitIslands`; regex `<div data-play="([a-z0-9-]+)"(?: data-input='([^']*)')?><\/div>`; `data-input` stays unused here.
- `components/topic/TopicReader.tsx:235` -- maps an island segment to `<PlayIsland id>`; no change expected.
- `content/dsa/dsa-binary-search.ts` -- remove the `.demo` block and `<script>` (about lines 155-282) after the placeholder at line 153; the mirrored block is `data-code="binary-search-classic"` (lines 65-74).
- `components/reader/enhancements.ts`, `narration.ts`, `scrollRegions.ts` -- already skip `[data-island]`; verify, do not change.
- `components/chapter/useChapterKeys.ts`, `lib/shortcuts.ts` -- chapter keys; the Player must stop its handled keys from reaching them (check how they filter targets).
- `lib/dom.ts` (`prefersMotion`), `lib/hooks.ts` -- reuse for motion; `components/dsa/CodeLanguageSwitch.tsx` -- the `role="status"` / `visually-hidden` pattern.
- `tests/client-bundle.test.ts`, `tests/chapter-islands.test.ts` (real chapter must still split and stay tag-balanced), `tests/claims.test.ts`, `tests/dsa-curriculum.test.ts` (binary search is in `DEPTH_ALLOW`).
- `e2e/smoke.spec.ts:1835` -- the "renders its play island" test asserts the stub text and zero buttons; rewrite it. `e2e/a11y.spec.ts:30` already runs axe on this page in nine themes.
- `app/globals.css` -- `.demo`, `.loop-code`, `.hot`, `.viz__cell--*` stay (other chapters use them).
- `content/architecture/arch-design-system.ts`, `arch-tech-stack.ts`, `arch-rendering.ts`, `arch-testing.ts`, `arch-health.ts` -- counts that this entry moves.
- New: `lib/play/types.ts`, `lib/play/registry.ts`, `lib/play/binarySearch.ts`, `components/play/Player.tsx`, `components/play/player.module.css`, `tests/play-binary-search.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `lib/play/types.ts` -- Tracer, Frame, Cell, ParseResult types -- the model every later port follows
- [x] `lib/play/binarySearch.ts` -- the tracer: lines mirroring `binary-search-classic`, presets, parse with limit 16, run recording the frames with narration -- the tracer under test
- [x] `lib/play/registry.ts` -- `loadTracer(id)` with one dynamic import line per play id -- lazy per chapter
- [x] `components/play/Player.tsx`, `components/play/player.module.css` -- controls, scrubber, scoped keys, status narration, visibility pause, reduced motion, array/code/variables views -- the Player
- [x] `components/play/PlayIsland.tsx` -- load the tracer, run the default input, render the Player with props; unknown id fallback -- fills 1.1's stub
- [x] `content/dsa/dsa-binary-search.ts` -- remove the inline demo and script, keep prose consistent -- chapter has no inline script
- [x] `tests/play-binary-search.test.ts` -- per preset: final frame equals the reference answer (checked against a plain linear search over random sorted arrays too), every frame has narration, every `line` and `next` is a declared id, comparisons never exceed floor(log2 n)+1, `parse` refuses over-limit, unsorted, empty and non-numeric input; the tracer's `lines` equal the mirrored chapter block line by line; the chapter body has no `<script>` and still splits into islands; negative fixtures prove the line and answer checks can fail
- [x] `e2e/smoke.spec.ts` -- rewrite the play island test; add: first frame present, Next/Back/Home/End by keyboard with code line, `lo`/`hi`/`mid` and narration in sync, Play advances then stops, scrubber label and keys, Reset, keys do not move the chapter or scroll the page, reduced motion has no transitions, hidden tab pauses
- [x] `content/architecture/*` -- update counts and describe the Player and the registry where the chapters describe islands -- claims test stays green
- [x] `.cspell/project-words.txt` -- append any new words at the end

**Acceptance Criteria:**
- Given `/dsa/dsa-binary-search` loaded, when read with JavaScript disabled, then the HTML holds the Player's first frame (array, code, variables, narration, "Step 1 of N").
- Given focus inside the Player, when a keyboard user presses Right, Left, Home, End and Space, then the frame, the marked code line, `lo`, `hi`, `mid` and the narration change together, Space plays and pauses, and neither the page nor the chapter moves.
- Given the last frame, when Play is pressed, then it restarts from frame 1, and it stops itself on the last frame.
- Given the tab becomes hidden or the Player unmounts while playing, then playing stops.
- Given `prefers-reduced-motion: reduce`, then the Player has no transition or animation and stepping still works.
- Given the chapter file, then it contains no `<script>`, and `tests/chapter-islands.test.ts`, `tests/client-bundle.test.ts` and `tests/claims.test.ts` pass.
- Given the production build, then the Implementation Notes record the chapter payload before and after, and the tracer code is not in any client chunk.
- Given axe in nine themes on the page, then there are no violations.

## Implementation Notes

- Tracer model in `lib/play/types.ts`, tracer in `lib/play/binarySearch.ts` (10 line ids mirroring `binary-search-classic`, 4 presets, limit 16, 18 frames for the default input), lazy registry `lib/play/registry.ts` (a Map of dynamic imports, `loadTracer` is null for an unknown id).
- `PlayIsland` is an async server component: it runs the default input and passes frames, lines and the title to the client `Player` as props, so the tracer is never in a client chunk and the first frame is in the server HTML. `TopicReader` is a client component and could not import it, so `topicPages.tsx` now builds the island elements and passes them in as an `islands` prop (a change the plan did not foresee).
- Payload on the production build for `/dsa/dsa-binary-search`: HTML 117,278 B before and 120,793 B after (26,752 and 24,923 gzipped); JS chunks 16 files 818,386 B before and 17 files 823,250 B after (256,875 and 258,987 gzipped). The tracer strings are in `.next/server` and not in `.next/static`. Decision on the unknown: render on the server and pass frames as props; the frames cross the wire once in the HTML and once in the flight data, about 3.5 kB, which is smaller than shipping the tracer. Entry 2.6 will load the tracer on the client with the registry's dynamic import, only when the reader edits the input.
- Beyond the plan: the Player root has `tabIndex=-1` so a click inside makes the keys work, and focus moves to Play or Next when a step button reaches an end and disables.
- A global `code` style leaked into the code view (every line a yellow pill); `.codeText` resets it. Seen in screenshots at 1440 and 390 after the fix; no horizontal scroll.
- Chapter keys (`]`, `[`, `n`, `p`, `t`, `/`) do not use the arrows, Home, End or Space, so `stopPropagation` has nothing to block today and no test can observe it; it stays as a guard for later keys.
- Architecture chapters updated: CSS modules 22 to 23, `"use client"` files 80 to 81, a11y 82 to 84 tests and 12 to 13 states, smoke 104 to 108, browser tests 200 to 206, and a paragraph on the registry and the Player.

## Plan Change Log

## Review Triage Log

### 2026-10-08 — Review pass
- verdicts: 21 findings (duplicates across lenses merged) — high 0, medium 3, low 14, false 4, maybe-false 0
- findings:
  - `[medium]` `[patch]` blind-hunter, verification-gap: the "mirrored line drifts" fixture asserts a mutated copy differs from its original, so it cannot fail — the comparison becomes a helper and the fixture feeds it the drifted lines
  - `[medium]` `[patch]` verification-gap: Space with focus on the group is not checked for page scroll — an e2e step records scrollY and pathname around two Space presses
  - `[medium]` `[patch]` blind-hunter, edge-case-hunter, verification-gap: the Implementation Notes with the payload numbers and the decision were missing — written here
  - `[low]` `[patch]` edge-case-hunter: held Space auto-repeats and flips play and pause — repeat is ignored
  - `[low]` `[patch]` edge-case-hunter: the seeded LCG loses low bits above 2^53 — BigInt or Math.imul; a duplicates case added with the blind-hunter duplicate finding
  - `[low]` `[patch]` blind-hunter, edge-case-hunter: duplicate values are accepted, narration may not say the first match — tested as "any index holding the target"
  - `[low]` `[defer]` blind-hunter: a Fast autoplay floods a screen reader — deferred to the play sweep
  - `[low]` `[defer]` blind-hunter: the Player throws when frames shrink or are empty — entry 2.6 swaps the frames
  - `[low]` `[defer]` blind-hunter: no unmount test and a weaker duplicate bundle guard — play sweep
  - `[low]` `[defer]` blind-hunter, edge-case-hunter, verification-gap, intent-alignment: unit-test totals stale — frame sweep
  - `[low]` `[reject]` blind-hunter: the scrubber's accessible name changes each step — the spec asks for a scrubber labelled "Step n of N"
  - `[low]` `[reject]` blind-hunter: islands pass to the reader by index — both lists come from the same segments array in one place
  - `[low]` `[reject]` blind-hunter: the `mid` line's comment is misleading — it is the existing chapter block's text, mirrored on purpose; the comment is true for fixed-width integer languages
  - `[low]` `[reject]` blind-hunter: the old demo's "candidates left" and the four-versus-ten line are gone — the loop narration states the remaining count each step and the chapter prose keeps the claim
  - `[low]` `[reject]` blind-hunter: e2e copies frame count and narration from the tracer — the tracer is deterministic and the tests name the exact expected text
  - `[low]` `[reject]` edge-case-hunter: PlayIsland has no try/catch for a failing tracer — the default input is covered by unit tests, and a thrown build error should surface
  - `[low]` `[reject]` edge-case-hunter: TopicReader renders nothing when `islands` is missing — only topicPages calls it, with both props together
  - `[false]` `[reject]` intent-alignment: Space scroll and the chapter keys are not proven — the chapter keys use other keys; scroll is now tested (see patches)
  - `[false]` `[reject]` blind-hunter: the plan is unfinished — closed out here
  - `[false]` `[reject]` blind-hunter: the manual screenshot check is not recorded — recorded in Implementation Notes
  - `[false]` `[reject]` intent-alignment: the unit tests never render the Player — the Verify line is satisfied by the e2e tests, all 206 passing

## Design Notes

Frames are recorded once and the Player only indexes into them, so Back, scrub and reset are free and the narration for every step is testable without a browser. Keeping the tracer on the server and passing frames as props answers the "twice on the client" unknown by construction; the registry's dynamic import is what entry 6 will reuse on the client when the reader edits the input.

A frame, for the default input after the first comparison:

```
{ line: "compare", next: "move-lo", narration: "a[4] = 20 is smaller than 31, so the answer is to the right.",
  vars: [["lo",0],["hi",9],["mid",4],["a[mid]",20],["target",31]],
  cells: [{value:1,state:"out",marks:[]}, … {value:20,state:"mid",marks:["mid"]}, …] }
```

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: all green, comments check clean
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: success
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (e2e serves the production build on port 3100)

**Manual checks (if no CLI):**
- Screenshots of `/dsa/dsa-binary-search` at 1440 and 390 in two themes, the Player mid-run: no horizontal scroll, the marked line and marks readable.

## Auto Run Result

**Summary:** `/dsa/dsa-binary-search` now has a working step-by-step player. A tracer is a pure function that records every frame once; a lazy registry maps the play id to it; the server `PlayIsland` runs the default input and passes the frames to the client `Player` as props, so the tracer never reaches the client and frame 1 is in the server HTML. The Player has Back, Next, Play/Pause, Reset, Slow/Normal/Fast, a "Step n of N" scrubber, keys scoped to the player (Left, Right, Space, Home, End; a held Space is ignored), one `role="status"` narration sentence, a pause on a hidden tab and on unmount, and no transitions under reduced motion. The array, code (current and next line marked in text) and variables views stay in step. The inline demo and its script are gone from the chapter.

**Files changed:** `lib/play/{types,binarySearch,registry}.ts`, `components/play/{Player.tsx,PlayIsland.tsx,player.module.css}`, `components/reader/topicPages.tsx` and `components/topic/TopicReader.tsx` (islands prop), `content/dsa/dsa-binary-search.ts`, `tests/play-binary-search.test.ts`, `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, and the architecture chapters that state the counts.

**Review:** 21 findings: medium 3, low 14, false 4. Patched 6 (mirror fixture that could not fail, Space scroll test, notes and payload numbers, held-Space repeat, random generator precision, duplicate values), deferred 4 low (live-region flood at Fast, Player with changing frames, unmount test and duplicate bundle guard, stale unit-test totals), rejected the rest with reasons logged.

**Follow-up review recommended:** false.

**Verification:** `npm run check` 472 unit tests, build ok, full e2e 206/206 including axe on the page and on the stepped player in nine themes; screenshots at 1440 and 390 with no horizontal scroll. Payload: HTML +3.5 kB, JS chunks +4.9 kB (one chunk), tracer only in server output.

**Residual risks:** the stub text and the old inline demo are gone for binary search only; the seven other chapters keep their inline demos until entries 2.4 and 2.5.
