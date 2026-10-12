---
title: 'Mock interview in the home language: lobby, loop wizard, readiness, room, scorecard and guide'
type: 'feature'
ticket: ''
created: '2026-10-12'
status: 'built'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-workbench-pages-home-style.md', '{project-root}/_bmad-output/implementation-artifacts/plan-interview-and-architecture-home-style.md', '{project-root}/_bmad-output/implementation-artifacts/plan-topic-pages-home-style.md']
warnings: ['oversized']
deferred: []
baseline_revision: '4805b58'
---

<intent-contract>

## Intent

**Problem:** Home, the menu, topic pages, chapters, the interview book, the architecture section and the practice workbench are one family now. The mock interview (`/mock`) is still the old site: the lobby, the loop wizard, the readiness card, the interview room (timer, questions, answer area, code editor, notes), the scorecard and the lobby guide. The owner asked to redesign it, as the first of the remaining pages (then review, then progress, one after another).

**Approach:** Bring the whole mock flow into the same language, reusing `TopicKit`, `Journey`, `MenuKit`, `ChapterKit`, the home pieces and the workbench shell (`FrameHeader`, `workbench.module.css`) where they fit: the lobby and guide as home-style scene pages (one-screen hero, composed stage, trail of the loop's stages), the loop wizard as a calm stepped choice flow, the readiness card as a taped card with honest numbers, the room as a focused tool screen (fills the viewport like the playground, family chrome, calm timer ring, the interviewer's question as the featured quote, follow-ups as notes), the scorecard as a debrief scene (a stamped overall result, rubric rows, strengths and gaps as sticky notes, a next-step trail). Real behaviour and data stay exactly as they are.

## HARD CONSTRAINT: the whiteboard stays untouched

The owner does not want the whiteboard changed in any way. Do NOT edit anything under `app/whiteboard/`, `lib/whiteboard*`, or the mock room's whiteboard component and its logic (`app/mock/Whiteboard.tsx`, its canvas, tools, shapes, shortcuts, saving). Do not restyle the whiteboard's toolbars or canvas, and do not change how it is mounted or sized in a way that alters its behaviour. The surrounding mock chrome (the room's header, the panel that hosts it) may adapt to the family look; if hosting the whiteboard needs a layout change that could affect it, leave the host panel's behaviour exactly as it is and tell me.

## Scope

1. `/mock` lobby: `app/mock/Lobby.tsx`, `ChoiceCards.tsx`, `LoopWizard.tsx`, `Readiness.tsx`, `LobbyGuide.tsx`, `guide.module.css`, `MockApp.tsx` (header and shell), `TimerRing.tsx`.
2. The room: `app/mock/Room.tsx` (everything except the whiteboard component), question and answer panels, notes, code editor chrome, the end-of-round and abandon dialogs.
3. The scorecard: `app/mock/Scorecard.tsx`.
4. `app/mock/mock.module.css` (3,300 lines) is the big file: replace rules with family rules, delete dead ones, split into smaller modules if that makes the result cleaner, and leave no dead CSS.
Not in scope: whiteboard (see above), review and progress pages (next rounds), the interview book, the workbench pages, `lib/mock/*` logic, scoring, banks and session storage.

## Boundaries & Constraints

**Always:**
- Start with fresh screenshots of every mock screen at 1440x900 and 390 (lobby, wizard steps, readiness, room in each stage type, the code and whiteboard stages, scorecard, guide) and compare with home, the interview book and the workbench; reuse the kits and tokens; anything two surfaces share goes in the shared place.
- Behaviour unchanged: loop planning, stage banks and preloading, timers and pausing, session reduce and storage, keyboard shortcuts, answer capture, marks, the scorecard maths, resume of an unfinished session, links into the interview book and chapters, the Menu pill. Keep every e2e role and name or update the tests in the same change.
- The room is a tool: it fills the viewport on desktop with no page scroll and no blank bands, works down to 390 (stack), and keeps the focus area uncluttered; the timer stays readable and does not jitter or re-layout every second.
- Typography: the `--t-*` scale on `:root`; weights 400 and 700; nothing under 12px; headings in `--font-heading`, prose in `--font-body`, code in the code face; eight handwriting styles and nine themes must hold.
- Rules learned in earlier rounds: balanced space under the header (at least clamp(48px, 8vh, 96px) above the highest decoration on scene pages), measured one-screen hero capped in height, text uses the full width of its panel, nothing part-transparent at any scroll position, no transition that shows two states at once, no one-frame flash before hydration (anything that depends on saved sessions or progress is hidden until hydration, with an e2e watching every frame), no `data-fx` scroll reveals, reduced-motion safe.
- The success moments and scoring language stay honest: no confetti-only celebration, no invented numbers; every number comes from data.

**Never:** comments in source (`npm run comments` fails them); hex, white or literal colours (theme tokens only); hard offset shadows; edits to `.claude/skills/` or `_bmad/`; touching port 3000 or any broad `pkill`; committing, pushing or staging (the coordinator does that).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| New visitor | `/mock` | Hero, composed stage, loop stages as a trail, clear start; readiness shows an honest empty state | none |
| Unfinished session | Saved session | Resume card in the lobby, no flash of the wrong state | stale session falls back to the lobby |
| Wizard | Pick role, level, loop, length | Calm steps, summary card, start | invalid combination blocked with a message |
| Room | Each stage type incl. coding and design (whiteboard) | Family chrome, timer, question quote, follow-ups, answer area; whiteboard behaves exactly as before | bank missing shows an honest error state |
| End and scorecard | Finish or abandon | Debrief scene with real scores, strengths and gaps, links back | no-score state handled |
| Phone | 390 and 320 | Stacks cleanly, tap targets 44px | none |
| Fonts and themes | 8 styles x 9 themes | No clipping or overlap; axe passes | none |

</intent-contract>

## Code Map

- `app/mock/*` -- lobby, wizard, readiness, room, scorecard, guide, timer, shell (`Whiteboard.tsx` is OFF LIMITS)
- `app/mock/mock.module.css`, `guide.module.css` -- styles
- `lib/mock/*` -- logic (read only)
- `components/frame/FrameHeader.tsx`, `components/practice/workbench.module.css`, `components/ui/MenuKit.tsx`, `components/topic/TopicKit.tsx`, `Journey.tsx`, `components/chapter/ChapterKit.tsx`, `components/home/*` -- the language to reuse
- `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `tests/*`, `content/architecture/*` -- tests and chapters whose asserted numbers change

## Tasks & Acceptance

- Given every mock screen at 390, 1440 and 1920, then each is visibly the same family as home and the interview book, the room fills the viewport on desktop, and nothing overlaps.
- Given a full mock run (lobby to wizard to room to scorecard) and an abandoned run, then everything works as before (the existing e2e covers it; extend where chrome changed), and the whiteboard is byte-for-byte unchanged (verify with `git diff --stat -- app/whiteboard lib app/mock/Whiteboard.tsx` showing nothing for those paths, and say so in the report).
- Given eight handwriting styles and nine themes, then nothing is clipped or overlapped and axe passes in all nine themes at 1440 and 390 on the mock states the e2e opens.
- Given `npm run check`, `npm run build` and the full e2e in a clean copy, then all pass; architecture chapter numbers asserted by `tests/claims.test.ts` are updated.

## Implementation Notes

(agent: log progress here, newest last)

**Build 1**
- Whiteboard untouched: `app/mock/Whiteboard.tsx` still imports `./mock.module.css`, so that file now holds only the whiteboard rules (board, tools, stencils, foot, `.hint`, `.spacer`), copied byte for byte from the old file, plus the two foot buttons keeping the look the old `.page .btn` rule gave them. Everything else moved to new modules (`mockKit`, `shell`, `roomBar`, `lobby`, `plan`, `readiness`, `guide`, `room`, `scorecard`). `git diff --stat -- app/whiteboard lib app/mock/Whiteboard.tsx` is empty. The whiteboard sits in the room's right pane (scrolls inside it if short); its sizing and behaviour are unchanged.
- Shell: `MockApp` uses `FrameHeader` (new `tool="room"`): in the room the header carries the round rail (segments plus "Round n of m"), the elapsed clock and End, so the room has no strip of its own. Lobby and debrief are `TopicPage` scenes.
- Lobby: one-screen hero (kicker, "A mock interview that pushes back" with the underline, lead, two actions, chips) and a composed stage (sample exchange, a follow-up card, a self-marking card, and one real-state card: resume, last result or first-time note, hidden until hydration, with an e2e sampling every frame), then numbered bands: 01 how it works, 02 start here (tabs; the loop wizard as a calm stepper with paper choice cards and a taped live-plan note, the review as dashed round rows; single round picker; retry list), 03 how ready you are (taped gauge, streak, next-up sticky, competencies, heat table, record, with an honest empty state), 04 to 07 the guide (rounds decoded, how you are scored, sample debrief, FAQ).
- Room: from 1001px up the page does not scroll; two panes (interviewer with the question as the featured quote and the coach; the answer with the timer ring, the notes and actions), follow-up as a sticky note, review with the model answer on the left and the rubric on the right (marks as colour-coded pills), a brief scene, a coding room reusing the exercise layout (workbench `interview` mode now fills the room and the console is smaller), a coding outcome card. Below 1001px everything stacks and the page scrolls.
- Debrief: hero with the stamp, the strongest and weakest round, then numbered bands (round by round, skills with the hire bars, what to work on next as sticky notes with a numbered trail, every question, what next).
- Tests: new `e2e/mock.spec.ts` (7), `/mock` joins the hero-measure test in smoke, three new a11y states (loop planner review, single round picker, design round on the whiteboard tab), `tests/topic-type.test.ts` covers the nine new modules and the mock components, `tests/theme-roles.test.ts` loses the avatar exceptions. Architecture chapters: 50 CSS modules, whiteboard.module.css as the largest, 89 client files, 48 states, 163 axe tests, 8 specs and 423 tests, 826 unit tests, the line-count chart without mock.module.css, a "mock interview pages" section in the design-system chapter.
- Found and fixed on the way: the chapter kit's phone-width "Mark as read" button lost its 44px height when the build's CSS order changed (composed `.btnSmall` beat the media rule at equal specificity; now `button.finishBtn`); the global zebra and grid rules on tables flattened the heat map and the round table, so both override them.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- in a clean scratch copy: `npm run build`, then `npm run check`, then `npx playwright test --workers=3 --retries=0` -- expected: all green (a known home rail landing test can flake under load; rerun it alone before reporting a failure)

**Manual checks:**
- Own screenshots over several rounds at 390, 1440 and 1920 of the lobby, each wizard step, the readiness card, the room in a talk stage and a coding stage, the scorecard and the guide; Classic, Marker, Chalk, Reading, Roboto; light, Night, lavender, blueprint; next to home and the interview book to judge one family.

## Auto Run Result

Built. Independent check in a clean copy on the final code: `npm run build` ok; `npm run check` 826 unit tests in 43 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 433 of 433 with no retries. The whiteboard is untouched: `git diff --stat -- app/whiteboard lib app/mock/Whiteboard.tsx` prints nothing and `git status` shows no whiteboard file changed (`app/mock/Whiteboard.tsx` still imports `./mock.module.css`, which now holds only the whiteboard rules). The lobby, loop wizard, readiness, room, coding round, debrief and guide were rebuilt in the home language on the shared kits. Screenshots reviewed by the coordinator: the lobby hero and the "Four steps" band at 1440x900 and the lobby hero at 390, Classic light. Not verified by eye: the room, the coding room, the debrief, the wizard, Night and other themes and fonts, 2560 wide, print.
