---
title: 'Home interview book: make the book look like a real photographed book'
type: 'feature'
ticket: ''
created: '2026-10-09'
status: 'built'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-home-scroll-motion.md']
warnings: ['oversized']
deferred: []
baseline_revision: '91f3742a3c9f3d00153b5c315636257efac8c8ff'
---

<intent-contract>

## Intent

**Problem:** The interview book scene (`#loop`, `components/home/BookPages.tsx`, `InterviewScene.tsx`, `interview.module.css`) still does not look like a real book, especially in dark themes (the owner's latest screenshot, night theme): the cover reads as a flat neon salmon-pink border, the pages are dark grey UI panels rather than paper, a pale blank gap sits around the ribbon bookmark and the bottom of the gutter, the headband stripes and the page-block edges look like a CSS outline rather than stacked paper, and the overall object has no weight or light. They said: "the book is not realistic, the border is wrong, the bookmark and the white gap around it is wrong, the UI is not realistic".

**Approach:** Treat the book as a PHYSICAL OBJECT that keeps its own materials in every theme: cream paper with dark ink, a deep cloth or leather cover, cream page-block edges, a fabric ribbon, a lit gutter. Introduce dedicated `--book-*` material tokens (defined in each of the nine theme blocks, so the colour-literal and theme-contract tests stay satisfied and each theme can tint the cover) and rebuild the book's rendering around them with believable lighting: a single light direction, a contact shadow on the page background, paper that curves into the spine, page-block thickness made from many fine alternating lines, a cover with board thickness, rounded corners, an embossed hairline, a cloth texture and a spine, a properly attached ribbon that lies on the page and hangs below the block with a swallow-tail cut. All text, behaviours, data, pin lengths and page-turn mechanics stay.

## Boundaries & Constraints

**Always:**
- Branch `feature/platform-topics` (HEAD 91f3742); only the interview book scene's rendering changes (`BookPages.tsx`, `InterviewScene.tsx`, `interview.module.css` and the minimum shared bits); the content, data, behaviours, accessibility, pin lengths, `lib/pageFlip.ts` mechanics, the round tablist, the stage tabs, tests' intent and all other scenes stay; no commits, no staging; Node 24 (`PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH`); do builds, e2e and screenshots in a scratch copy of the repo under your scratchpad (rsync excluding .next, .git, .vercel, .claude, _bmad; `git init -q` in the copy; build first so generated types exist; a font-fetch error in a build is transient, retry once); only ports 3100 to 3102; NEVER touch the dev server on port 3000; NEVER run a broad `pkill` or `killall` (kill only a specific pid whose cwd is under your scratchpad); no comments in source; no dead code; append new spelling words to the end of `.cspell/project-words.txt`; update the architecture chapters for every number or sentence that moves (`tests/claims.test.ts` green).
- Materials as tokens: add `--book-paper`, `--book-paper-shade` (the gutter-side darkening), `--book-ink`, `--book-ink-soft`, `--book-rule` (hairlines), `--book-cover`, `--book-cover-dark`, `--book-cover-light`, `--book-edge` (page-block edge cream), `--book-ribbon`, `--book-gold` (embossing and the headband thread) and `--book-shadow` to every theme block in `app/globals.css` (and wherever the nine theme definitions live), with values that look like real materials in each theme (paper stays cream in dark themes with dark ink; the cover is a deep tone derived from the theme's accent or red family, not a neon; text on paper meets AA contrast against `--book-paper` in all nine themes and the contrast test must cover the new pairs). Respect the repo rules: no hex outside the theme token definitions, no white, tokens only in component CSS; extend `tests/theme-contract.test.ts`, `tests/contrast.test.ts` or the theme-role allowlists only as needed and keep them honest.
- Cover and object (all nine themes): the book is a closed-cover board spread open: a visible cover that extends a few pixels beyond the page block on all sides with rounded outer corners (about 6 to 10px) and a rounded inner joint, board thickness shown as a darker strip along the bottom and outer edges, a cloth or leather texture from stacked fine gradients (never an image, never noisy), a very subtle highlight along the upper-left edge (single light source up-left) and an embossed gold-thread hairline inset on the cover border, NOT a bright flat border; the spine joint at the centre with a visible hinge groove, a darker spine cloth at the very top and bottom of the gutter where the headband sits (a small twisted two-tone headband cord: fine alternating vertical gold and cover stripes, 6 to 8px tall, seated on the page block not floating above it); an elliptical, soft, low-contrast contact shadow on the page background under the whole book (a real shadow, not a coloured glow; tokens), plus a slightly stronger shadow under the cover edge so the book lifts off the surface; a slight perspective tilt (a few degrees) is allowed but the text must stay crisp.
- Pages: paper from `--book-paper` with a barely visible fibre texture (very low contrast repeating gradients), a soft gutter gradient on both pages using `--book-paper-shade` that gets darker and narrower toward the centre fold and a thin dark crease line at the fold, a faint page-curl highlight near the gutter on the left page and a lighter outer area, rounded outer corners, a hairline margin rule, running header and folio in `--book-ink-soft` small caps, and book typography in `--book-ink`; the handwritten notes keep their ink (red pen for the candidate's wrong answer from a ink token that is readable on paper), the taped sticky note uses a paper-yellow token with a real tape strip (a semi-transparent paper-coloured strip with subtle serrated ends made from gradients and a slight shadow), the "loses the room" stamp is a rubber stamp in a red ink token with a rough inked edge made from layered gradients and slight rotation; the "Read this round" control looks like a printed tab or a stamped label, not a UI button, but stays a real focusable link with visible focus.
- Page-block thickness: on both halves a stack of fine alternating paper and shade lines (repeating-linear-gradient 1 to 2px period) along the outer edge and the bottom, thicker on the side with more pages (left thin at stage 1, growing with the stage, mirrored on the right), with a slight stepped bevel at the corners, in `--book-edge` and a darker shade; the blank gap and any pale area at the foot of the gutter and around the ribbon must be removed (the cover shows under the block, never a page-coloured or white strip).
- Ribbon bookmark: a fabric ribbon in `--book-ribbon` (a deep cloth red or the theme's accent darkened, not neon), attached at the headband inside the gutter, lying flat across the right page's top margin (casting a thin shadow and slightly sagging), hanging out below the page block with a swallow-tail cut, a subtle weave texture (fine diagonal gradient) and fold shadow where it bends over the page edge; it must not cover any text or the "Read this round" control, and there must be no pale or white gap around it (check the area at the bottom of the gutter at 1280, 1440 and 1920 in all nine themes). It swings very slightly only when a page turns (transform only; none under reduced motion).
- Thumb-index tabs: keep the four real stage buttons but render them as cut thumb-index tabs set into the right page block's edge, in four muted tab colours from tokens (not saturated neon), rounded outer corners, a thin darker edge, their labels in `--book-ink` or paper colour with AA contrast, the active tab pulled out further with a soft shadow; they sit within the book's right edge and never overlap the cover's rounded corner badly.
- Page turn and behaviour unchanged (strips, shading, cast shadow, riffle, pin lengths, reduced-motion fallback, phone fallback), but the turning leaf must use the paper and shade tokens so it reads as paper in every theme, with the back face slightly lighter and the cast shadow tinted from `--book-shadow`; check mid-turn frames for flicker, clipped text bleeding through and hard seams between strips.
- Visual verification: screenshot the whole scene at rest, with each of the four stages, and at 15, 35, 50, 65 and 85 percent of a flip at 1280x720, 1440x900, 1920x1080 and 390 (phone fallback) in ALL themes you can reach, at least dark (night), light, lavender and blueprint, and with handwriting and reading fonts; look at every frame critically as a senior designer asking "would this pass for a photographed real book on a desk?"; iterate over several rounds on light, shadow, material and proportions until it does; also compare against a photo-like reference you hold in mind (cloth hardcover, cream pages, gold thread, ribbon). Check the pale-gap area around the ribbon and gutter bottom explicitly in dark themes.
- Tests: keep the existing book tests (text overlap probes for all 20 rounds, flip cap, tablist, pin behaviour, no-JS) and update selectors; add: the new `--book-*` tokens exist in all nine themes (theme-contract), the paper-versus-ink pairs pass the contrast test in all nine themes, no pale or paper-coloured pixel strip under the page block and around the ribbon (a screenshot-based or computed-style probe: the element under the block's bottom edge is the cover, and the ribbon's bounding box does not intersect any text box), axe clean in nine themes at 1440 and 390 for the book at rest and on a mid stage, no horizontal overflow.

**Never:** Do not change content, data, round behaviour, pin lengths or other scenes; do not use images, canvas, WebGL or a library; no noisy textures; no neon or saturated flat colours for the cover or ribbon; no hex or white outside the theme token definitions; no glow or blur blob (real shadows only); do not let the book's texture hurt text contrast.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Dark theme (night) | 1280x720 to 1920x1080 | cream paper pages with dark ink, deep cloth cover, gold-thread hairline, ribbon lying on the page, soft contact shadow | none |
| Light and lavender themes | same | same materials, cover tinted by theme, no loss of contrast | none |
| Gutter bottom and ribbon | all themes | no pale or white gap; the cover shows under the block; ribbon clear of text and the Read link | none |
| Mid page turn | 15 to 85 percent | paper-coloured leaf bending with shading and cast shadow, no seams, no flicker | none |
| Stage change | tab click | riffle with the new tokens, page-block thickness updates | none |
| Reduced motion or phone | media features | static spread or stacked page, no ribbon swing, same materials | none |
| Contrast | all nine themes | ink on paper at least AA | none |

</intent-contract>

## Code Map

- `components/home/BookPages.tsx`, `components/home/InterviewScene.tsx`, `components/home/interview.module.css` -- the book markup, the leaf strips, the tabs, the ribbon and the page content; `lib/pageFlip.ts` (angles, strips, shading helpers), `components/home/useSceneScroll.ts`, `fx.ts` (the page-turn driver; unchanged in behaviour).
- `app/globals.css` and the nine theme definitions (find where `--paper`, `--sheet`, `--ink` and the themes live: add the `--book-*` tokens beside them); `tests/theme-contract.test.ts`, `tests/contrast.test.ts`, `tests/colour-literal.ts`, `tests/theme-roles.test.ts` (categorical-colour allowlist for `app/home.module.css` and the interview module).
- `e2e/smoke.spec.ts` (the book tests, text probes), `e2e/textProbe.ts`, `e2e/motionProbe.ts`, `e2e/a11y.spec.ts` (book states); `content/architecture/*` (line counts, test counts, tokens list if it names the theme tokens).

## Tasks & Acceptance

**Execution:**
- [ ] `--book-*` tokens in all nine themes plus contrast and contract tests
- [ ] rebuild the book object rendering (cover, spine, headband, page block, pages, ribbon, tabs, stamp, tape, shadows) with the tokens; remove the old styles that no longer apply
- [ ] leaf and flip rendering on paper tokens; check mid-turn frames
- [ ] probes and tests for the pale gap, ribbon clearance, contrast; update e2e selectors and a11y states
- [ ] `content/architecture/*`, `.cspell/project-words.txt`; cleanup audit; Implementation Notes

**Acceptance Criteria:**
- Given the book in any of the nine themes, then it reads as a physical hardcover: cream paper with dark ink, a deep cloth cover with board thickness and a gold-thread hairline, a lit gutter with a crease, stacked page edges, a ribbon lying on the page and hanging below with a swallow-tail, and a soft contact shadow, with no pale gap at the gutter bottom or around the ribbon and no neon flat border.
- Given a page turn at any progress, then the leaf looks like bending paper with consistent shading, no seams, flicker or bleed-through, and all text remains crisp and readable.
- Given text on paper in all nine themes, then contrast is at least AA and the tests cover the new token pairs.
- Given `npm run check`, `npm run build` and the full e2e, then all pass with axe clean in nine themes at 1440 and 390; your own screenshots, reviewed over several rounds in dark, light, lavender and blueprint at 1280x720, 1440x900, 1920x1080 and a phone, would pass for a photographed real book.

## Implementation Notes

Progress log (agent restart safe; newest last). Working tree is the real repo; verification copy lives in the session scratchpad (`bk/`, dev server on 3101, helper scripts in `bk-tools/`: `sync.sh` rsyncs the repo into the copy, `book.mjs` screenshots the pinned book at a pin offset: `node book.mjs <w> <h> <theme> <tag> <name>:<stage>:<item>:<x>`, x 0.2 = rest, 0.4 to 1.0 = page turn).

- Tokens: 15 `--book-*` colour tokens (paper, paper-shade, ink, ink-soft, rule, cover, cover-dark, cover-light, edge, ribbon, gold, shadow, pen, note, tape) restated in all nine theme blocks of `app/globals.css` (after `--info`). Paper stays cream with dark ink in every theme; the cover is a deep cloth tone per theme. `tests/contrast.test.ts` has a new block: all 15 tokens in every theme, ink and soft ink on paper and edge, pen on paper, ink on the note, the highlighted row and every tab tint, cover distinct from paper (all at least 4.5:1, cover 4:1). `tests/theme-contract.test.ts` needed no change (it demands every theme restate the base colour tokens, which they do).
- Rendering rebuilt in `components/home/interview.module.css`: cloth cover with a gold-thread hairline, board thickness from stacked offsets, a narrow hinge slit; page-block stacks as fine alternating edge lines (left, right, tail; thickness is a 0.2 to 1 ratio of `--block-max`, set from `InterviewScene`); paper faces with fibre texture and a page-owned curl (a 1 to 2px crease plus a gradient over about 12% of the page width on each page); a thin cloth ribbon lying in the crease with a swallow-tail that hangs below the block and swings once on a page change; thumb-index tabs cut into the block edge; printed facts line, rubber stamp with worn ink, taped sticky note, printed label link; a lit desk pool and a contact shadow. Phones get a cloth-bound case round the stacked pages.
- Owner feedback rounds during the build (coordinator messages): (1) the thin dark seam through the leaf was the gutter overlay drawn above the leaves, now removed (the crease belongs to each page); (2) the leaf now bends smoothly with the free edge leading (`lib/pageFlip.ts`: `LEAD` 1.3, linear bend, `PERSPECTIVE` 9000, `LIFT` 4) so it stays within 14px of the page block vertically; each strip carries two shade layers and two paper veil layers that `fx.ts` writes, so shading and the text fade ramp across strips with no seam, and text is veiled before it is squashed; the cast shadow follows the leaf on the right page and on the left page (`castLeft`); (3) the headbands were removed completely at the owner's request, and the ribbon is no longer on the leaf (it is one static element below the leaves, so a turning leaf passes over it).
- Tests: e2e `smoke.spec.ts` gained four probes (no headband and one static ribbon never on a leaf; leaf width within its bend envelope, within 14px vertically, text veiled when edge-on; no solid saturated strip wider than 5px in the gutter at rest and through a turn; no thin dark vertical line inside the leaf, checked by pixel columns, which I proved fails when the old gutter overlay is put back). `tests/page-flip.test.ts` follows the new bend direction and the veil. Architecture chapters updated (78 custom properties, 71 colour tokens, globals.css about 8,000 lines, 323 browser tests, smoke 193 and 167 flows).

- Performance round (coordinator: p95 50 ms through the pinned book). Measured in production builds at 1440x900 with 60px wheel steps every 24 ms through `#loop` (`bk-tools/perf.mjs`, rAF deltas plus CDP metrics, 3 runs). Baseline HEAD 91f3742: p50 16.7, p95 16.7 to 16.8, p99 33.2 to 33.4, 3 to 5 frames over 33 ms, 4.7 ms task per frame. Before the fix: p95 50.0, p99 50.1 to 66.7, 43 to 51 frames over 33 ms, 9.3 to 10.3 ms task per frame. Root cause found by injecting CSS into the running build: the cost was rasterising the page faces, not the overlays, the ribbon filter, the box-shadows or the desk pool (turning each of those off changed nothing; dropping the face gradients fixed it). Each new leaf rasterises 12 face copies, and five full-face gradient layers including two repeating radial grains were far too much. Fix: the gutter and curl are one gradient sized to the gutter only (`8.5em 100%`, no-repeat), the grain is one repeating linear layer, the full-face diagonal light was dropped; the text veil is now the opacity of each strip's `.inner` over a paper `.clip` (no veil elements), so a leaf carries 24 shade overlays instead of 48 overlays plus veils. After: p50 16.7, p95 16.7 to 16.8, p99 16.8, 0 to 2 frames over 33 ms, 4.5 to 5.1 ms task per frame (CDP: script 0.4 ms, style 1.3 ms, layout 0.3 ms). The overlay count is 24, not 8: the shade ramp needs from and to layers on both faces of each of 6 strips; frame time, not the count, is the measured target.
- Stuck state: `useSceneScroll` now schedules a trailing settle after the last scroll event, intersection change or `scrollend` (`SETTLE_MS` 140), which repaints the exact values; before, an intersection callback that arrived while Lenis was still marked active skipped its repaint and no later frame came, leaving a section at `exit` 1. The e2e polls the values instead of reading them after a fixed wait.
- Visual round: tilt lowered from 11 to 6 degrees; the text veil starts earlier (`LEGIBLE` 0.8, `FADE` 0.45) so a narrow leaf shows no squashed text; the desk pool is fainter (8 and 3.5 percent) so it reads as a lit surface the shadow falls on.

## Plan Change Log

No change to the contract during the build; owner screenshots drove the gutter, headband, ribbon and leaf-envelope fixes recorded in Implementation Notes.

## Review Triage Log

## Verification

**Commands:**
- in the scratch copy: `npm run build`, then `npm run check`, then `npm run test:e2e` -- expected: all green

**Manual checks (if no CLI):**
- Look at the book next to a photo-like mental reference after every change; check the gutter bottom and ribbon area in the night theme first.

## Auto Run Result

Built. Independent check in a clean copy: `npm run build` ok; `npm run check` 626 unit tests pass (one pre-existing lint warning in `components/topic/useReadingPlan.ts`, not part of this work); production scroll through `#loop` at 1440x900 p50 16.7 ms, p95 16.7 to 16.8 ms, 0 to 9 frames over 33 ms across three runs (the nine were a cold first run); full e2e 323 of 323 (a first pass lost four tests to the test server dropping at the end of the run, `ERR_CONNECTION_REFUSED`; the four pass when rerun alone). Frames reviewed at 1440x900 at rest and mid-turn: cloth cover, paper pages, one thin ribbon, leaf inside the book.
