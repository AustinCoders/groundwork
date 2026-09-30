---
title: 'Fix the keyboard traps and the broken skip link'
type: 'bugfix'
ticket: '2'
created: '2026-09-30'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/planning-artifacts/audit-2026-09-28/ux-a11y.md']
warnings: ['oversized']
deferred:
  - summary: >-
      arch-tech-stack.ts says "Vitest: 15 test files" while tests/ holds 19.
    evidence: |-
      Pre-existing before this change; arch-testing.ts and vitest both report 19 files. Story 4 (stale copy) can assert it from the tests folder.
    location: >-
      content/architecture/arch-tech-stack.ts:150
    severity: low
  - summary: >-
      ChapterView's n, p, [, ] and t shortcuts act on the page behind the open Chapters sheet and site menu.
    evidence: |-
      The keydown handler has no dialog guard; the sheets were already aria-modal before this change. A5 (single-key shortcuts) owns the reader's keys.
    location: >-
      components/series/ChapterView.tsx:165-177
    severity: low
  - summary: >-
      Nothing makes the page behind a trapped panel inert, so a screen reader's virtual cursor can leave it.
    evidence: |-
      The three dialogs carry aria-modal, which current screen readers mostly honour; the audit's A2 fix proposed inert on #main while open. Not required by the story's intent.
    location: >-
      components/FocusTrap.tsx
    severity: low
  - summary: >-
      The Shell's mobile drawer is not role=dialog/aria-modal and has no close button inside it.
    evidence: |-
      Pre-existing markup in components/Shell.tsx; the only ways out are Escape, a link, and the aria-hidden backdrop.
    location: >-
      components/Shell.tsx:209-214
    severity: low
  - summary: >-
      No axe check runs with a dialog open (site menu, Chapters sheet, Filters sheet, open sidebar).
    evidence: |-
      Unverified. Settle by running axe at 390 with each of the four panels open, e.g. in story 3's a11y sweep.
    location: >-
      e2e/a11y.spec.ts
    severity: medium (unverified)
baseline_revision: '925ed3b874a6089240bbf3e24875b658e5755a39'
---

<intent-contract>

## Intent

**Problem:** Keyboard users hit four faults (ux-a11y.md A1–A4):

1. At 900px and below, the old Shell's closed sidebar stays focusable, so Tab walks through 40–80 hidden controls.
2. The site menu, the series Chapters sheet and the problems Filters sheet say `aria-modal` but neither trap focus nor return it.
3. The flashcard drill and the mock room's brief step take Enter and Space page-wide, so focused buttons and links don't activate.
4. The Playground's "Skip to the editor" link points at an id that doesn't exist.

**Approach:**
- Make the closed sidebar inert.
- Trap, loop and restore focus in the three dialogs with one shared helper.
- Let the two shortcuts step aside for any focused control through one shared guard.
- Give the skip link a real target.
- Add `e2e/keyboard.spec.ts` at 390px to cover each fault.

## Boundaries & Constraints

**Always:**
- Reuse `@radix-ui/react-focus-scope` (already a dependency and already used by `Shell.tsx` and `ShortcutHelp.tsx`) for trapping. Put the dialog focus behaviour in one shared component or hook. epic-topic-redesign entry 1 moves the Chapters sheet into a shared ChaptersSheet, and that component must carry the same behaviour.
- A focus trap loops and moves focus into the dialog when it opens. It returns focus to the element that opened the dialog on Escape and on close.
- The shortcut guard is one shared function. It ignores events that are already `defaultPrevented`, and events whose target is inside `button, a, summary, input, textarea, select, [role=button], [role=dialog], [contenteditable]`.
- Keep every existing Escape behaviour, including the SiteDrawer search clearing its query on Escape first.
- No comments. Theme tokens only.
- New e2e specs and tests update the counts that `tests/claims.test.ts` asserts, in `content/architecture/arch-testing.ts`.

**Never:**
- Do not change what the shortcuts do when focus is on the page body or the card or stage itself.
- Do not restyle anything or change layout.
- Do not touch the topic reader's single-key shortcuts (A5, not this story).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Closed sidebar | `/notes` at 390px, sidebar closed, Tab from the top | Focus never lands inside the closed sidebar | No error expected |
| Open sidebar | `/notes` at 390px, menu opened | Focus moves into the sidebar and loops inside it; Escape closes it and returns focus to the menu button | No error expected |
| Site menu | `/review` at 390px, Menu opened | Tab loops inside the menu; Escape (with an empty search) closes it and returns focus to Menu | No error expected |
| Chapters sheet | `/git/merge` at 390px, Chapters opened | Focus moves into the sheet and loops; Escape returns focus to the Chapters button; its `aria-controls` names the sheet | No error expected |
| Filters sheet | `/problems` at 390px, Filters opened | Same trap, loop and return as above | No error expected |
| Drill | `/interview/questions` drill running, a card closed, focus on Stop | Enter activates Stop; with focus on the card or body, Enter and Space still reveal the card | No error expected |
| Mock brief | Mock room brief step, menu open, focus on a drawer link | Enter follows the link, and the round does not start | No error expected |
| Skip link | `/practice?id=free`, activate "Skip to the editor" | Focus lands inside the editor region | No error expected |

</intent-contract>

## Code Map

- `components/Shell.tsx:108-217`:
  - `drawerOpen`, `asideRef` and `MaybeFocusTrap` (line 29 uses FocusScope trapped loop).
  - The aside is always rendered.
  - `asideRef.current?.focus()` at :143 does nothing, because the aside has no `tabIndex`.
  - Fix: at the mobile breakpoint, make the closed aside `inert` and hidden from assistive tech. Give it `tabIndex={-1}`. On close, return focus to the menu button.
- `app/globals.css` around 3654-3673: the `@media (max-width: 900px)` block. The sidebar is hidden only with `transform: translateX(-102%)`. Add `visibility: hidden` for the closed state, with a transition that keeps the slide.
- `components/SiteDrawer.tsx:493-530`:
  - It already has a portal, `role="dialog"` and `aria-modal`, focuses the first link and restores focus.
  - It has no trap. Wrap the dialog in the shared focus component.
  - Keep the search's own Escape handling (:341-345). The dialog's Escape closes only when the search has no query.
- `components/series/ChapterView.tsx:165-177, 271, 497-514`:
  - The Chapters sheet has no initial focus, trap or return.
  - The trigger's `aria-controls="arch-rail"` points at the desktop aside. Point it at the sheet's id.
- `app/problems/ProblemsView.tsx:149, 258-265, 482-484, 627-650`: the Filters sheet closes on Escape but has no focus handling.
- `app/interview/questions/QuestionBank.tsx:54-67`: the drill's window `keydown` calls `preventDefault()` for Enter and Space on any non-input target.
- `app/mock/Room.tsx:737-771`: the brief step's Enter handler at :757 has no guard. The review step guards buttons and links at :758.
- `app/practice/PracticeClient.tsx:69`: the skip link targets `#editor`, which does not exist. Put `id="editor"` and `tabIndex={-1}` on the editor region in `components/practice/PracticeWorkspace.tsx`, or point the link at that region's existing id.
- **New shared pieces** (the builder chooses names):
  - a dialog-focus wrapper or hook around FocusScope, for example in `components/`;
  - the shortcut guard, for example in `lib/`.
- `e2e/keyboard.spec.ts` (new): one test per matrix row, at a 390px viewport set in the spec. Seed state the way `e2e/smoke.spec.ts` does. Reach the mock brief as the existing mock e2e flow does.
- `tests/claims.test.ts:124-190` counts the a11y, smoke and whiteboard specs and asserts "Browser tests: 3 specs". Make it count every `e2e/*.spec.ts`. Add a `keyboard.spec.ts` row to the table in `content/architecture/arch-testing.ts`, and update the heading and subtitle totals.

## Tasks & Acceptance

**Execution:**
- [ ] `components/Shell.tsx`, `app/globals.css` -- make the closed mobile sidebar inert and hidden, focus it on open and return focus on close -- A1
- [ ] the shared dialog-focus component, `components/SiteDrawer.tsx`, `components/series/ChapterView.tsx`, `app/problems/ProblemsView.tsx` -- trap, loop, initial focus and return on Escape and close, and fix the Chapters `aria-controls` -- A2
- [ ] the shared shortcut guard, `app/interview/questions/QuestionBank.tsx`, `app/mock/Room.tsx` -- focused controls keep Enter and Space -- A3
- [ ] `app/practice/PracticeClient.tsx`, `components/practice/PracticeWorkspace.tsx` -- a real skip target -- A4
- [ ] `e2e/keyboard.spec.ts`, `tests/claims.test.ts`, `content/architecture/arch-testing.ts` -- one keyboard test per matrix row at 390px, and the spec counts -- the surface check

**Acceptance Criteria:**
- Given a keyboard user at 390px, when they use `/notes`, `/review`, `/git/merge`, `/problems`, the question-bank drill, the mock brief and `/practice`, then every matrix row holds.
- Given `npm run check`, `npm run build` and `npm run test:e2e`, when they run, then all pass, a11y included.

## Implementation Notes

## Plan Change Log

## Review Triage Log

### 2026-09-30 — Review pass
- verdicts: 45 findings — high 0, medium 6, low 29, false 9, maybe-false 1
- findings:
  - `[low]` `[patch]` Architecture chapters (arch-rendering:94, arch-performance:121-127, arch-tech-stack:136, arch-design-system:229-231, 240) still describe FocusScope as next/dynamic in Shell, "six calls in five files" and a focused sidebar — the tree now has five calls in four files; implementer corrected the copy.
  - `[false]` `[reject]` arch-repo-map.ts says "Playwright: 3 specs" — the chapter dates its counts to `git ls-files` at d6b12d7, where three specs is right.
  - `[low]` `[patch]` arch-tech-stack.ts "4 specs" is typed by hand with no claims case — grouped with the spec-count entry; claims case added.
  - `[low]` `[defer]` arch-tech-stack.ts "Vitest: 15 test files" is stale (19 files) — pre-existing before this change; fits story 4 (stale copy).
  - `[low]` `[reject]` ShortcutHelp keeps its own next/dynamic FocusScope instead of the shared FocusTrap — its trap works; migrating it is a refactor outside the three dialogs the intent names.
  - `[low]` `[patch]` Room's Cmd/Ctrl+Enter and 1/2/3 still fire with focus on a link in the open site menu — Cmd+Enter on a focused link is an Enter the intent says should reach the link; early return inside `[role=dialog]` added, as the drill has.
  - `[low]` `[defer]` ChapterView's n, p, [, ] and t act behind the open Chapters sheet and site menu — pre-existing reader shortcuts; A5's story owns them.
  - `[medium]` `[patch]` Skip link focuses the `.workbench` wrapper before the editor's tabs and toolbar, and the test accepts the wrapper — wrapper now hands focus to the CodeMirror view; test asserts `.cm-content` focus.
  - `[low]` `[patch]` FocusTrap runs Radix `loop` and `loopTabWithin` on one element, relying on listener order — Radix `loop` dropped; `trapped` kept.
  - `[low]` `[patch]` `belongsToControl` also yields for defaultPrevented events and dialogs, so the name misleads — renamed and callers updated.
  - `[false]` `[reject]` `[contenteditable]` matches `contenteditable="false"` — the only such nodes are read-only CodeMirror views; Room returns early inside `.cm-editor` and the drill renders no editor.
  - `[false]` `[reject]` Callers keep overlapping guards — QuestionBank's early return also covers 1/2/3 and Escape, and Room's `typing` check covers the 1/2/3 branch the helper does not guard.
  - `[low]` `[reject]` The 900px breakpoint now lives in DRAWER_LAYOUT as well as CSS, onResize and closeOnMobileNav — the value already lived in three places; unifying them is a refactor, not a direct correction, and the breakpoint does not change in normal work.
  - `[low]` `[reject]` Widening past 900px with the drawer open returns focus to the hidden toggle, so it falls to body — the old MaybeFocusTrap's Radix unmount did the same; rare resize-while-open, and the fix needs a new guard.
  - `[low]` `[defer]` Nothing makes the page behind a trapped panel inert for a screen reader's virtual cursor — the three dialogs carry aria-modal; the Shell drawer's missing dialog semantics are pre-existing.
  - `[low]` `[defer]` The Shell drawer is not role=dialog/aria-modal and has no close button inside — pre-existing markup, unchanged by this diff.
  - `[medium]` `[patch]` No test checks the desktop sidebar is not inert — grouped with the breakpoint entry; closed-sidebar test widens to 1280 and checks.
  - `[low]` `[reject]` Focus return via ×, backdrop or "Show N problems" is untested — every close path unmounts the sheet and runs the one cleanup the Escape tests exercise.
  - `[low]` `[reject]` Space is never pressed on a focused control — Space and Enter share one guarded branch in the drill, which the Enter-on-Stop test covers.
  - `[low]` `[patch]` The mock test's "follows the link" cannot be observed, since the link points at the current page — grouped with the mock Enter entry; test retitled to what it observes.
  - `[maybe-false]` `[defer]` No axe check runs with a dialog open — medium if true (unverified); settle by running axe with each of the four panels open at 390 (story 3's a11y sweep).
  - `[low]` `[patch]` Room's handler ignores the modal site menu for Cmd+Enter and 1/2/3 — same entry as above.
  - `[false]` `[reject]` Focus already inside the scope when the trap activates makes close refocus a node inside the dialog — unreachable: the sheets and menu mount with the trap, and the Shell aside is inert while closed at 900px and below, so focus cannot be inside it when it opens.
  - `[low]` `[reject]` An opener hidden or detached at close (sheet closed after widening) drops focus to body — needs a resize while a sheet is open; the fix adds a guard.
  - `[low]` `[reject]` Narrowing past 900px with focus in the desktop sidebar makes it inert under focus — rare resize with focus in the sidebar; the fix adds a new effect.
  - `[medium]` `[patch]` Skip link stops at the wrapper — same entry as above.
  - `[low]` `[reject]` The claims count omits specs in subfolders, named *.test.ts, or using test.describe — none exist; the old code hard-coded three, and handling hypotheticals adds complexity.
  - `[low]` `[patch]` arch-tech-stack "4 specs" unasserted — same entry as above.
  - `[low]` `[reject]` FocusScope is now a static import, joining first-load JS — on Shell pages the one hoisted copy (1.1.16) already ships through Radix Select in ThemeFontPicker; elsewhere it adds a small module; making it dynamic again adds complexity for negligible bytes.
  - `[low]` `[patch]` Spec counts outside arch-testing are not tied to `specFiles.length` (pre-verified gap) — tech-stack case added; repo-map is a dated snapshot and stays.
  - `[medium]` `[patch]` Nothing presses Enter with focus on the page in the mock room (pre-verified gap) — mock test now presses Enter from the brief heading and expects the round to start.
  - `[medium]` `[patch]` `inert` is never checked across the 900px breakpoint (pre-verified gap) — closed-sidebar test widens to 1280 and checks the sidebar is usable.
  - `[false]` `[reject]` The repo map is now wrong — dated snapshot at d6b12d7, as above.
  - `[low]` `[patch]` arch-rendering.ts:94 still lists FocusScope as next/dynamic in Shell — same entry as the architecture-chapters one.
  - `[low]` `[reject]` At 900px and below, "/" in the reader no longer focuses the inert search and the next letters fire single-key shortcuts — before, "/" focused a search box the reader could not see and letters went into it unseen, so the flow was already broken; A5's fix ("keep / only when focus is on body") owns it and needs the drawer opened from ReaderShell.
  - `[medium]` `[patch]` Skip-link test checks the region, not the typing area — same entry as above.
  - `[low]` `[patch]` Mock test's URL check cannot show navigation — same entry as above.
  - `[false]` `[reject]` The handlers are guarded, not scoped to the card or stage — the plan's Never keeps them page-wide from non-control targets, and the intent's outcome (focused controls activate) holds.
  - `[low]` `[reject]` The closed-sidebar test is pinned to Shell markup on /notes, which epic-topic-redesign entry 1 moves — every Shell route moves in that epic; its builder rewrites this test when `#site-sidenav` leaves /notes, and the missing element fails loudly.
  - `[low]` `[defer]` The page behind is not inert (the audit's fuller fix) — same entry as above.
  - `[low]` `[reject]` Nested listboxes inside the trapped menu are untested — one hoisted copy of @radix-ui/react-focus-scope means Radix Select's own scope pauses the trap, and the drawer's Escape still skips `[role=listbox]` (unchanged); the implementer checked the pickers by hand.
  - `[false]` `[reject]` The open Shell sidebar's trap was replaced beyond the intent — the plan asks for one shared trap; the open-sidebar test passes.
  - `[low]` `[reject]` Radix focus-scope joins the initial JS of many pages — same as the static-import row above.
  - `[false]` `[reject]` The mock review step's Enter guard is broadened — inputs already return earlier; the extra matches (role=button, select, dialogs, defaultPrevented) are cases the review Enter should leave alone.
  - `[false]` `[reject]` The claims test and site copy change beyond the intent — AGENTS.md requires the counts in content/architecture to move with the specs.

## Design Notes

A focus trap only makes sense while the dialog is visible. The old Shell's aside is a dialog only at mobile widths, and a plain sidebar above 900px, so the trap and the inert state apply only at the mobile breakpoint, as `MaybeFocusTrap` already does. `inert` removes the closed aside from both tab order and the accessibility tree, and `visibility: hidden` keeps it out even in browsers where `inert` is not yet supported.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass, with `e2e/keyboard.spec.ts` included. e2e serves on 3100; never touch 3000.

## Auto Run Result

**Summary:** Keyboard users at 900px and below no longer tab into the closed Shell sidebar (`inert` plus `visibility: hidden`). The open sidebar, the site menu, the series Chapters sheet and the problems Filters sheet share one `FocusTrap`: focus moves in, Tab loops, and closing returns focus to the opener. The flashcard drill and the mock room step aside for focused controls and for the open site menu. "Skip to the editor" lands in CodeMirror. `e2e/keyboard.spec.ts` covers each matrix row at 390px.

**Files changed:**
- `components/FocusTrap.tsx` (new): shared trap around Radix FocusScope (`trapped`), with its own first-stop focus, Tab loop over real tab stops, and focus return on close.
- `lib/shortcuts.ts` (new): `shortcutShouldStepAside`, the one guard for page-wide shortcuts.
- `components/Shell.tsx`, `app/globals.css`: closed aside `inert` at the drawer breakpoint, hidden with a delayed visibility transition; `FocusTrap` replaces the lazy `MaybeFocusTrap`.
- `components/SiteDrawer.tsx`, `components/series/ChapterView.tsx`, `app/problems/ProblemsView.tsx`: dialogs wrapped in `FocusTrap`; the Chapters button's `aria-controls` names `chapters-sheet`.
- `app/interview/questions/QuestionBank.tsx`, `app/mock/Room.tsx`: guarded Enter and Space; Room ignores keys from inside `[role=dialog]`.
- `components/practice/PracticeWorkspace.tsx`: `#editor` target that hands focus to the editor.
- `e2e/keyboard.spec.ts` (new): 8 tests at 390px.
- `tests/claims.test.ts`: counts every `e2e/*.spec.ts`, asserts each spec's row and the tech-stack spec count.
- `content/architecture/arch-testing.ts`, `arch-tech-stack.ts`, `arch-rendering.ts`, `arch-performance.ts`, `arch-design-system.ts`: counts (301 unit, 104 browser, 4 specs) and the focus-trap and next/dynamic descriptions.
- `docs/roadmap.html`: t47 done (artifact version 9).

**Review findings:** 45 findings (medium 6, low 29, false 9, maybe-false 1). Eight entries patched: skip link to the typing area (medium), positive Enter paths in the mock room (medium), sidebar usable above the breakpoint (medium), Room ignoring the modal menu (low), one Tab loop (low), guard renamed (low), tech-stack spec-count claim (low), architecture copy on FocusScope and next/dynamic (low). Five deferred (frontmatter `deferred`). Rejected rows and their reasons are in the Review Triage Log.

**Follow-up review:** recommended (`true`): three medium entries were patched. The unverified risk is the patch round's new behaviour, which no reviewer has read: the `.workbench` `onFocus` redirect (clicking the wrapper's padding now also focuses the editor), and Room's early return inside `[role=dialog]`.

**Verification:** after the patches, `npm run check` passes (typecheck, lint, comments, prettier, cspell, vitest 19 files and 301 tests). `npm run build` passes, and `npm run test:e2e` passes 104/104 on port 3100, including all 8 keyboard tests. Before the patches, the implementer ran the new spec against a build of 925ed3b, where all 8 tests failed at their faults.

**Residual risks:**
- The reader's `/` shortcut does nothing at 900px and below while the sidebar is closed and inert; the next letters fire single-key shortcuts. A5 owns this.
- The closed-sidebar test uses `/notes` on Shell, and epic-topic-redesign entry 1 moves `/notes` off Shell, so that entry rewrites the test.
- `content/topics.ts` still says "166 unit tests, 74 browser tests" for How this is built. This is pre-existing; story 4 (stale copy) takes it.
