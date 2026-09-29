# Colour map for entry 4: the global rules and the topic pages

Planning classification of every fixed-colour use in the global rules of `app/globals.css` (outside the theme blocks), `components/reader/ReaderShell.tsx` and `components/reader/narration.ts`, made on 2026-09-29 by three read-only subagents from the scan in the plan.

The plan (`story-global-rules-and-the-topic-pages-on-the-roles-plan.md`) is the authority. Its Code Map settles every call marked uncertain below; where the plan and this file disagree, follow the plan. Line numbers are from baseline 5956722.

---

# classify-A: app/globals.css lines 720–2999

Scope: 48 scan entries fall in 720–2999. There are **no** `var(--ide-accent|--ide-green|--ide-red|--ide-yellow)` consumers in this range (checked for any `--ide-`; the only `--ide-*` lines are the theme blocks above 720).

Format: `line | selector | old → new | reason`. "(text)" means a text-pairing change forced by the move, not a role token.

---

## 1. Base typography and focus (global element rules)

768 | `h2::after` | `--hl-yellow` → `--mark` | title highlighter stroke behind every bare h2; text on it stays `--ink` (see uncertain U6 for dark themes)
823 | `li::marker` | `--red` → `--primary` | red-pen bullet is decoration of the theme identity, not a state; accent is the only non-state role (uncertain U1)
827 | `:focus-visible` | `--red` → `--primary` | global focus ring

## 2. Reader chrome

869 | `.progress` | `--red` → `--primary` | fixed reading-progress fill at the top of ReaderShell (`#progress`); progress fill = accent

## 3. Sidebar widgets (Shell)

1213 | `.daily-recap` | `--sticky-bg` → KEEP | "yesterday you…" toast drawn as a rotated sticky note; deliberate sticky-note illustration, same look as in-body `.sticky` (uncertain U2)
1214 | `.daily-recap` | `--sticky-fg` → KEEP | pairs with 1213; move both or neither

## 4. Settings rows (`.setrow` / `.stepper` / `.dd`)

1499 | `.setrow__play.is-on` | `--red` → `--primary` | narration voice-preview button while playing (`NarrationSettings`, `is-on` = previewState "playing"); an on/selected toggle, not an error
1500 | `.setrow__play.is-on` | `--red` → `--primary` | same, glyph colour on `--btn-bg`
1538 | `.stepper__btn:focus-visible` | `--red` → `--primary` | focus ring (inset, on `--btn-bg`)
1872 | `.dd__btn:focus-visible` | `--red` → `--primary` | focus ring on the Radix select trigger (`components/ui/select.tsx`)

## 5. Sidebar nav `.site-navlink*`

1583 | `.site-navlink--accent` | `--hl-mint` → `--primary-soft` | "Playground" CTA link at the top of the rail; soft tint matches today's weight (uncertain U3: or `--primary` + `--on-primary`)
1584 | `.site-navlink--accent` | `--sticky-mint-fg` → `--ink` (text) | text on `--primary-soft` is `--ink`
1649 | `.site-navlink__dot` | `--green` → `--success` | "ready to read" status dot on each topic link (vs dashed `.is-soon`); a status, not decoration (uncertain U4)
1677 | `.site-navlink.is-active` | `--hl-mint` → `--primary-soft` | current topic (Shell `TopicLink`) / current chapter (`ChapterNav`) background; text already `--ink`

## 6. Code blocks

2188 | `.codeblock__copy.is-done` | `--green` → `--success` | "copied ✓" confirmation (enhancements.ts toggles `is-done` for 1.6 s); transient success state
2189 | `.codeblock__copy.is-done` | `--green` → `--success` | border of same

## 7. Chapter sheet (head, badge, narration)

2250 | `.chapter__head h1::after` | `--hl-yellow` → `--mark` | highlighter band behind the chapter title
2292 | `.chapter.is-done .badge::after` | `--green` → `--success` | ✓ seal on the chapter number once read (ChapterDone toggles `.is-done`); text already `--sheet` (correct for a state fill)
2298 | `.is-narrating` | `color-mix(--hl-yellow 45%, transparent)` → `color-mix(in srgb, var(--mark) 45%, transparent)` | highlighter behind the paragraph being read aloud; keep the mix per rules

## 8. Cover map (`CoverMap.tsx` on topic cover pages)

2478 | `.covermap__budget-step.is-on` | `--hl-mint` → `--primary-soft` | selected segment of the "I've got 15m/30m/…" control (aria-pressed); text already `--ink`
2482 | `.covermap__budget-step:focus-visible` | `--red` → `--primary` | focus ring
2598 | `.station.is-done .station__num` | `--green` → `--success` | chapter number of a read chapter (16px bold; success on sheet-2 measured ≥ 4.97 in all nine themes)
2606 | `.station.is-done::before` | `--green` → `--success` | filled route dot = read
2607 | `.station.is-done::before` | `--green` → `--success` | its border
2611 | `.station.is-next` | `--hl-mint` → `--primary-soft` | the "continue here" station = current item background
2612 | `.station.is-next` | `--green` → `--primary` | current item border
2616 | `.station.is-next::before` | `--green` → `--primary` | current route dot fill
2617 | `.station.is-next::before` | `--green` → `--primary` | its border
2618 | `.station.is-next::before` | `box-shadow … --dg-box-green` → `box-shadow 0 0 0 4px var(--primary-soft)` | halo around the current dot (sits outside the station box, on the sheet)
2658 | `.station__tick:hover` | `--green` → `--success` | hover preview of "mark read" (turns into the done look)
2659 | `.station__tick:hover` | `--green` → `--success` | border of same
2663 | `.station__tick.is-done` | `--green` → `--success` | ✓ glyph of a read chapter (aria-pressed)
2665 | `.station__tick.is-done` | `--green` → `--success` | border
2666 | `.station__tick.is-done` | `--dg-box-green` → `--success-soft` | tint behind the ✓ (glyph is a 3:1 icon; success/success-soft is 4.17–7.49, passes 3:1)
2670 | `.station.is-reach` | `--dg-box-green` → `color-mix(in srgb, var(--primary) 8%, var(--sheet))` | stations after "next" that fit the chosen time budget: a selection derived from the budget control, so accent family, lighter than `is-next` (uncertain U5)
2676 | `.station.is-reach .station__min` | `--green` → `--primary` | minutes of in-budget stations; primary on the 8% tint is 5.26–15.3, OK for 12px
2680 | `.station.is-reach::before` | `--green` → `--primary` | ring on in-budget route dots
2736 | `.chip--done` | `--green` → `--success` | "read ✓" chip in the peek panel; success on `--sheet-2` is 4.97+ in all themes
2737 | `.chip--done` | `--green` → `--success` | its border

## 9. Cover TOC / search-result grid (`.toc`)

2801 | `.toc a:hover, .toc a:focus-visible` | `--hl-mint` → `--primary-soft` | hover on chapter link cards; text stays `--ink`

## 10. Chapter-body content (chapter HTML in `content/**`, plus a few UI stickies)

2867 | `.g` | `--green` → KEEP | "ours" line in a merge-conflict code sample (`content/git/merge.ts` only); code/diff colour, categorical (optionally re-point to `--c-green`)
2871 | `.r` | `--red` → KEEP | "theirs" line in the same sample (optionally `--c-red`)
2875 | `.sticky` | `--sticky-bg` → KEEP | sticky-note callout (57 content files, plus LevelView/SoonClient/Room)
2876 | `.sticky` | `--sticky-fg` → KEEP | pair
2886 | `.sticky.mint` | `--sticky-mint-bg` → KEEP | mint sticky note
2887 | `.sticky.mint` | `--sticky-mint-fg` → KEEP | pair
2912 | `.warn` | `--red` → `--caution` | left rule of the "⚠ gotcha" callout (87 content files + lib/interviewContent.ts); warning = caution per rules (uncertain U7)
2917 | `.warn` | `--red` → `--ink` (text) | whole callout body is red today; if the bg moves to `--caution-soft`, body text must be `--ink` (caution on caution-soft is only 4.27–4.52 in light/kraft/sepia/forest/lavender); give `.warn .ttl` `color: var(--caution)` (22px bold, passes 3:1) and change `--warn-bg` (a red rgba, not on the guard list) to `--caution-soft`

---

## Counts (48 entries)

| decision | n |
|---|---|
| primary | 13 (823, 827, 869, 1499, 1500, 1538, 1872, 2482, 2612, 2616, 2617, 2676, 2680) |
| primary-soft (incl. one 8% primary mix, and the halo) | 7 (1583, 1677, 2478, 2611, 2618, 2670, 2801) |
| mark | 3 (768, 2250, 2298) |
| success | 13 (1649, 2188, 2189, 2292, 2598, 2606, 2607, 2658, 2659, 2663, 2665, 2736, 2737) |
| success-soft | 1 (2666) |
| caution | 1 (2912) |
| text re-pair to `--ink` | 2 (1584, 2917) |
| KEEP | 8 (1213, 1214, 2867, 2871, 2875, 2876, 2886, 2887) |
| danger / info / on-primary | 0 |

---

## Task 2: actions painted with plain ink (or no accent) that should take `--primary`

Only the obvious ones, all in 720–2999:

- 798–800 `a { color: var(--ink) }` → `--primary`. The rule sets no `text-decoration`, so the UA underline stays as the non-colour cue. Most chrome links override colour already (`.site-navlink`, `.station`, `.toc a`, `.brand`, `.btn`), so this mainly hits in-body links (295 `<a ` in content). Links inside callouts: 3 inside `.sticky` (content/git/daily.ts, js/modules-tooling.ts, js/patterns-architecture.ts) and 3 inside `.warn` (js/basic-async.ts, js/execution-context.ts, js/strings-numbers-math.ts). Check `--primary` on `--sticky-bg`/`--sticky-mint-bg`, or add `.sticky a { color: inherit }` so stickies keep their own pair.
- 1401–1406 `.sidenav-progress__cta`: the Shell rail's "Start with X →" / "Continue: X" link is a plain `.btn` (ink on `--btn-bg`) at components/Shell.tsx:394 and :416. It is the rail's primary action. Give it `btn--primary` the way `.covermap__continue` already does (CoverMap.tsx:106). Note that `.btn--primary` (line 3928, outside this range) is itself `--hl-mint` today, so it depends on that rule moving to `--primary` + `--on-primary`.
- 1681–1683 `.site-navlink.is-active .site-navlink__num { border-color: var(--ink) }` → `--primary`: the ring on the current chapter's number in ChapterNav.
- 1945–1948 `.dd__opt:focus-visible { outline: 2px solid var(--ink-soft) }` → `--primary`: a focus ring.
- 2072–2074 `.search__input:focus { border-color: var(--ink-soft) }` → `--primary`: the input sets `outline: none`, so this border is the only focus cue (ReaderShell search).
- Optional, less clear-cut: 1867 `.dd.is-open .dd__btn` border `--ink-soft` (open state); 2683 `.station.is-peeked` border `--ink-soft` (selected/previewed station; it comes after `.is-next` in source, so hovering the next station swaps its new `--primary` border back to ink-soft, so decide the order deliberately). Left alone: `.fab` and `.skip-link` ink borders, `.toc a` ink outline (hand-drawn card style), `.covermap__peek-go` (secondary to the primary Continue button).

---

## Task 3: text-on-fill pairings after the move

- `.site-navlink--accent` (1582): text `--sticky-mint-fg` → `--ink` on `--primary-soft`. **If you choose `--primary` instead**, text must be `--on-primary` AND you must add a background to `.site-navlink--accent:hover` / `:focus-visible`: `.site-navlink:hover, .site-navlink:focus-visible` (specificity 0,2,0) beats `.site-navlink--accent` (0,1,0) and swaps the background to `--btn-hover`. Today that already happens, with mint-fg text on btn-hover. With `--on-primary` text it would become unreadable on hover or focus.
- `.site-navlink.is-active` + `.site-navlink--muted` (TopicLink can pass both on a "soon" topic): `--pencil` text on `--primary-soft` fails in kraft 3.98, blueprint 3.64 and forest 4.16. Add `.site-navlink.is-active.site-navlink--muted { color: var(--ink-soft) }`.
- `.station.is-next` (primary-soft) and `.station.is-reach` (8% tint): `.station__num` and `.station__min` are `--pencil` and need `--ink-soft` on those tints, for the same reason: pencil/primary-soft is 3.64–4.95. For `.is-reach`, `.station__min` goes to `--primary` (2676), so only `.station__num` is left to fix there.
- `.chapter.is-done .badge::after`: `--success` fill with `--sheet` text is already correct.
- `.station__tick.is-done`: the ✓ glyph stays `--success` on `--success-soft`. It is an icon (3:1), and the pair measures 4.17–7.49. As body text it would fail in light (4.17), so do not reuse the pair for words.
- `.covermap__budget-step.is-on`, `.toc a:hover`, `.site-navlink.is-active`: already `--ink` on `--primary-soft` (inksoft/primary-soft ≥ 4.84 too).
- `h2::after`, `.chapter__head h1::after`, `.is-narrating`: `--ink` on `--mark` is 6.44–14.52. Text inside a `.sticky` or `.warn` that gets narrated keeps its callout colour on the mark mix, which is minor.
- `.codeblock__copy.is-done`: `--success` text (13px) on `--btn-bg`; `--btn-bg` equals `--sheet` in the light themes, and success is ≥ 4.97 on sheet-2, so it is fine.
- `.setrow__play.is-on`: `--primary` glyph on `--btn-bg`; primary/sheet is 5.89–18.10, so it is fine.
- `.warn`: see 2917. The body goes to `--ink`, `.ttl` to `--caution`, and `--warn-bg` to `--caution-soft`. `.warn code` already sets `--ink`.
- `.daily-recap` (KEEP): `.daily-recap__today a` is `color: inherit`, so it stays on the sticky pair whatever the global `a` rule becomes.

---

## KEEP list (exact selectors)

- `.daily-recap` (background `--sticky-bg`, color `--sticky-fg`), provisional; see U2
- `.g`
- `.r`
- `.sticky`
- `.sticky.mint`

(`.warn` is **not** on the KEEP list in this proposal; see U7.)

Outside the scan, but theme-blind in range: line 2210 `.sheet::before { background: rgba(196, 52, 43, 0.32) }` is the notebook's red margin rule, hard-coded to light's `--red` in every theme. It is an illustration, so KEEP, but re-pointing it to `color-mix(in srgb, var(--c-red) 32%, transparent)` would let it follow each theme's red. The scrims at 1290/1773 and the callout code tints at 2899/2908 are neutral and fine.

---

## Where each family renders

- **Base typography / focus** (`h2::after`, `a`, `li::marker`, `:focus-visible`): every route. `h2::after` applies wherever a bare `h2` is not overridden (chapter bodies, cover pages, error/not-found, level, soon); overrides exist for `.route__name`, `.covermap__peek-title` and `.setgroup__title`.
- **Reader chrome `.progress`**: ReaderShell, meaning the 18 topic covers and their `[chapter]` pages: /notes, /react, /node, /css, /html, /typescript, /dsa, /testing, /security, /redis, /docker, /databases, /cloud-devops, /graphql, /nextjs, /nestjs, /system-design, /kubernetes.
- **Sidebar widgets and `.site-navlink*`** (Shell): all ReaderShell routes above plus /level/[x], /path (ChapterNavSection), /soon, not-found, error. `.site-navlink` also appears in BackButton's `rail` variant; `.is-active` + `__num` come from ChapterNav (reader chapter list, /path).
- **Settings rows**: `.setrow__play` and `.stepper__btn` via NarrationSettings (Shell rail, and SiteDrawer on /, /mock, /problems, /architecture, /interview, /git, /practice, /progress, /review) and ReaderShell zoom. `.dd__btn` via components/ui/select.tsx in ThemeFontPicker, NarrationSettings, PracticeWorkspace/CodeEditor (/practice) and /mock Room.
- **Code blocks** `.codeblock__copy`: reader chapter pages (enhancements.ts via ReaderShell), /git/[section] and /architecture/[chapter] (ChapterView), plus static markup in content/git/*.ts.
- **Chapter sheet** (`.chapter__head h1::after`, `.badge::after`): ChapterSheet on /<topic>/[chapter]. `.is-narrating` renders there and in ChapterView (/git/[section], /architecture/[chapter]).
- **Cover map** (`.covermap__*`, `.station*`, `.chip--done`): CoverMap in CoverSheet, on the 18 topic cover pages (/notes, /react, … /kubernetes).
- **`.toc`**: CoverSheet chapter grid (topic covers) and ReaderShell search results ("Matching chapters").
- **Chapter-body content** (`.g`, `.r`, `.sticky`, `.warn`): chapter HTML from content/** through ChapterSheet (reader) and ChapterView (git, architecture). `.warn` also appears in lib/interviewContent.ts (/interview/[chapter]). `.sticky.mint` is also used as UI in app/level/LevelView.tsx, app/soon/SoonClient.tsx and app/mock/Room.tsx. `.g`/`.r` appear only in content/git/merge.ts (/git/merge).

---

## Uncertain calls

- **U1 `li::marker` (823) → `--primary`.** The red bullet is pure decoration. The state tokens are ruled out ("never decoration"), which leaves accent or KEEP as `--c-red`. I chose accent so the theme reaches body lists; the alternative is KEEP via `--c-red`. It affects every `li` on every route, including lists inside stickies.
- **U2 `.daily-recap` (1213/1214) KEEP.** It is UI chrome, not chapter content, but it is drawn as a rotated sticky note that matches the in-body stickies. The alternative is `--mark` bg + `--ink` text: in light that is visually identical (`--mark` = `--sticky-bg` = `#ffe873`), and it would follow the theme elsewhere. A highlighter-as-panel-background stretches what `--mark` is meant for.
- **U3 `.site-navlink--accent` (1583) → `--primary-soft` + `--ink`.** This gives it the same background as `.site-navlink.is-active`, so it is told apart only by the ✎ icon, the → arrow and its separate section (today both are also `--hl-mint`). If you want a real CTA, use `--primary` + `--on-primary` plus hover/focus background overrides (see Task 3). Either way it should match whatever `.btn--primary` (line 3928, also `--hl-mint` today) becomes.
- **U4 `.site-navlink__dot` (1649) → `--success`.** It means "ready to read" (versus "soon"), which is a status but not done/passed. Users could read a success-green dot on every topic as "completed". The alternative is `--primary` (an accent dot).
- **U5 `.station.is-reach` (2670) → 8% primary mix.** This is a new mix. If you would rather not add one, `--primary-soft` works too: `.is-next` stays distinct through its solid `--primary` border, while `.is-reach` has a dashed `--line-soft` border. `--info-soft` is another option if the in-budget stations should not look selected.
- **U6 `h2::after` in dark / blueprint / rose.** The theme override (775–781) turns the highlighter into a 0.2em opaque stroke. `--mark` there is a dark tone (mark/sheet 1.64 / 1.58 / 1.52, versus about 2.2 for today's translucent hl-yellow), so the underline gets fainter. Options: accept it, or have the dark-theme override use `--primary` for the stroke.
- **U7 `.warn` (2912/2917) → `--caution`.** The rules put callouts under KEEP only with `--sticky-*`, and list "warning" under caution. `.warn` uses `--red`, carries a ⚠ title and holds gotchas, so I read it as caution. This is a visible change: red-text callouts become ink text with a caution rule and title. The alternatives are `--danger` (nearly identical to today's `--red`, same structure) or KEEP as categorical `--c-red`. Whichever you pick, `--warn-bg` (a red rgba, lines 31/182/252/322/392/462/532/602/672) should follow it.

---

# classify-B: app/globals.css lines 3000-4999

Scope: all 80 scan entries in the range. There are no `var(--ide-accent|--ide-green|--ide-red|--ide-yellow)` consumers in 3000-4999; the first one is at 5903.

"DEAD" means the selector's class appears nowhere in app/, components/, lib/ or content/ outside globals.css. I checked dynamic class building too: `t-${...}` is never built, and `tag--${level}` only ever gets beginner, intermediate or advanced. This matches audit finding 2 in `_bmad-output/planning-artifacts/audit-2026-09-28/code-quality.md`. The best fix for a DEAD rule is to delete it; the mapping is given only in case it is kept.

Format: `line | selector | old → new | reason`

## 1. Diagrams in chapter bodies (SVG `.dg` figures)

3051 | .dg .rd | fill --red → KEEP | diagram label colour inside chapter SVGs (categorical)
3055 | .dg .gr | fill --green → KEEP | diagram label colour (categorical)
3065 | .boxg | fill --dg-box-green → KEEP | diagram box category
3066 | .boxg | stroke --green → KEEP | diagram box category
3071 | .boxr | fill --dg-box-red → KEEP | diagram box category
3072 | .boxr | stroke --red → KEEP | diagram box category
3077 | .boxy | fill --dg-box-yellow → KEEP | diagram box category
3078 | .boxy | stroke --dg-yellow-stroke → KEEP | diagram box category
3089 | .lnr | stroke --red → KEEP | diagram arrow/line category
3095 | .lng | stroke --green → KEEP | diagram arrow/line category

## 2. Chapter "Run this" terminal (`.demo__term`, filled by components/reader/enhancements.ts enhanceTryBlocks, and the stepper "empty" chips)

3166 | .demo__term .ok | color --green → KEEP (uncertain) | every console.log line gets the class `ok`, so this is terminal-output colouring, not a pass state; see U1
3170 | .demo__term .err | color --red → --danger | console.error or a thrown error: a failure state

## 3. Chapter interactive demos (DOM sandbox, event bubbling)

3206 | .dom-sandbox p.de-highlight | background --hl-yellow → --mark | highlighter toggled by the classList demo (/notes dom-events); text stays --ink
3255 | .ev-box--inner | background --hl-mint → --primary-soft (uncertain) | the "inner — click me" target box in the bubbling demo; text is already --ink; see U2

## 4. Chapter step-through visualisers (`.loop-*`)

3302 | .loop-code div.hot | background --hl-yellow → --mark (uncertain) | the highlighter bar on the current line of the stepper; text is --code-fg; see U3
3318 | .loop-bar i | background --red → --primary | step progress bar (width = step / (steps-1)): a progress fill
3352 | .loop-frame--stack | background --dg-box-yellow → KEEP | legend colour for call stack / BFS frontier / fiber stack chips
3353 | .loop-frame--stack | border --dg-yellow-stroke → KEEP | same legend category
3358 | .loop-frame--micro | background --dg-box-green → KEEP | microtask queue legend category
3359 | .loop-frame--micro | border --green → KEEP | same
3360 | .loop-frame--micro | color --green → KEEP | same
3364 | .loop-frame--macro | background --dg-box-red → KEEP | macrotask queue legend category
3365 | .loop-frame--macro | border --red → KEEP | same
3366 | .loop-frame--macro | color --red → KEEP | same
3371 | .loop-frame--out | color --green → KEEP | console-output chips / BFS visit order, same terminal colour as .demo__term .ok (U1)

## 5. Chapter truth-table cells and chips (`.tone-*`: 69 yes, 51 bad, 9 warn, 5 no; in `<td>` and `span.chip`)

3453 | .tone-yes | background --dg-box-green → --success-soft | yes/true/works cell: good state
3454 | .tone-yes | color mix(--green 65%, --ink) → color-mix(in srgb, var(--success) 65%, var(--ink)) | same, keeping the mix
3463 | .tone-warn | background --dg-box-yellow → --caution-soft | "surprising/careful" cell: warning state
3464 | .tone-warn | color mix(--dg-yellow-stroke 50%, --ink) → color-mix(in srgb, var(--caution) 50%, var(--ink)) | same
3468 | .tone-bad | background --dg-box-red → --danger-soft | false/trap cell: bad state
3469 | .tone-bad | color mix(--red 70%, --ink) → color-mix(in srgb, var(--danger) 70%, var(--ink)) | same
(uncertain; see U4)

## 6. Chapter callout boxes (`.bx`: 75 is-prim, 251 is-ref)

3496 | .bx.is-prim | background --dg-box-green → KEEP | green callout box in chapter prose ("The honest summary", "Rules of hooks")
3497 | .bx.is-prim | border --green → KEEP | callout family
3501 | .bx.is-ref | background --dg-box-yellow → KEEP | yellow callout box / comparison box
3502 | .bx.is-ref | border --dg-yellow-stroke → KEEP | callout family

## 7. Dead demo widgets (readout, ruler, units)

3445 | .readout__v.is-yes | color --green → --success | DEAD; yes value
3449 | .readout__v.is-no | color --red → --danger | DEAD; no value
3556 | .ruler__u.is-in | background --hl-mint → --primary-soft | DEAD; in-range (selected) unit
3594 | .unit.is-pair | background --dg-box-yellow → KEEP | DEAD; surrogate-pair category
3595 | .unit.is-pair | border --dg-yellow-stroke → KEEP | DEAD; same

## 8. Buttons (`.btn--primary`, global)

3929 | .btn--primary | background --hl-mint → --primary | primary CTA; also add `color: var(--on-primary)` and change `border-color: var(--ink)` (3930) to `var(--primary)`
3937 | .btn--primary:hover | background --hl-mint → --primary | keep the brightness filter, or use color-mix(in srgb, var(--primary) 88%, var(--ink)); also restate `border-color: var(--primary)`, because `.btn:hover` (1804) sets --ink-soft

## 9. Old progress page (all DEAD; module precedent is app/progress/progress.module.css)

3997 | .progress-glow::before | mix(--green 22%, transparent) → var(--primary-soft) (or mix --primary 22%) | DEAD; progress.module.css made the same glow --primary-soft
4050 | .level-ring__fill | stroke --green → --primary | DEAD; progress ring fill
4168 | .stat-card--a .stat-card__icon | mix(--green 18%, --sheet) → KEEP (as --c-green-soft if kept) | DEAD; decorative icon tile
4174 | .stat-card--c .stat-card__icon | mix(--hl-yellow 55%, --sheet) → KEEP (as --c-yellow-soft if kept) | DEAD; decorative icon tile
4177 | .stat-card--d .stat-card__icon | mix(--red 16%, --sheet) → KEEP (as --c-red-soft if kept) | DEAD; decorative icon tile
4267 | .heatmap__day.is-level-1 | mix(--green 30%) → color-mix(in srgb, var(--primary) 25%, var(--sheet)) | DEAD; matches the module heatmap
4270 | .heatmap__day.is-level-2 | mix(--green 55%) → color-mix(in srgb, var(--primary) 45%, var(--sheet)) | DEAD
4273 | .heatmap__day.is-level-3 | mix(--green 78%) → color-mix(in srgb, var(--primary) 70%, var(--sheet)) | DEAD
4276 | .heatmap__day.is-level-4 | --green → --primary | DEAD
4309 | .badge-card.is-earned | border --card-accent, fallback --green → KEEP | DEAD; achievement (precedent: `.badge[data-earned]` stays categorical)
4320 | .badge-card.is-earned::after | shine mix of --card-accent/--green → KEEP | DEAD; achievement decoration
4349 | .level-up-banner | background --hl-mint → KEEP | DEAD; achievement (precedent: progress `.levelUp` stays categorical)
4350 | .level-up-banner | color --sticky-mint-fg → KEEP | DEAD; pairs with 4349

## 10. Old home page: card accents, featured card (all DEAD)

4409 | .t-yellow | --card-accent: --c-yellow → KEEP | DEAD; per-card category accent (only consumed by dead .featured/.topic-row/.badge-card)
4412 | .t-mint | --card-accent: --green → KEEP | DEAD; per-card category
4415 | .t-red | --card-accent: --red → KEEP | DEAD; per-card category
4457 | .featured__badge | color --sticky-mint-fg → --ink | DEAD; text on primary-soft
4458 | .featured__badge | background --hl-mint → --primary-soft | DEAD; "featured" pill used as a highlight/selected chip

## 11. Tags (`.tag--*`: /path, practice workspace, git chapters)

4636 | .tag--ready | border --green → --primary | DEAD ("ready" = available, not done)
4637 | .tag--ready | color --green → color-mix(in srgb, var(--primary) 70%, var(--ink)) | DEAD
4638 | .tag--ready | background --dg-box-green → --primary-soft | DEAD
4646 | .tag--beginner | border --green → KEEP | level scale (precedent: problems.module.css keeps --beginner/--intermediate/--advanced)
4647 | .tag--beginner | color mix(--green 65%, --ink) → KEEP | level scale
4651 | .tag--intermediate | border mix(--c-yellow 70%) → KEEP | level scale
4652 | .tag--intermediate | color mix(--c-yellow 60%, --ink) → KEEP | level scale
4656 | .tag--advanced | border --red → KEEP | level scale
4657 | .tag--advanced | color mix(--red 70%, --ink) → KEEP | level scale
4661 | .tag--done | border --green → --success | "solved ✓": done state
4662 | .tag--done | color --green → color-mix(in srgb, var(--success) 70%, var(--ink)) | text on a soft state tint (or --ink, per rule)
4663 | .tag--done | background --dg-box-green → --success-soft | done state tint

## 12. Level page syllabus (/level/[topic], components/Syllabus.tsx)

4846 | .syllabus-item.is-ready | border-left --green → --primary (uncertain) | marks a written (readable) chapter row, not a chapter the reader has finished; see U5
4866 | .syllabus-item.is-ready .syllabus-item__check | color --green → --primary (uncertain) | the ✓ glyph on the same rows; see U5
4895 | .syllabus-checkpoint | background --sticky-mint-bg → --info-soft (uncertain) | "✅ Checkpoint: …" goal note at the end of each level; see U6
4896 | .syllabus-checkpoint | color --sticky-mint-fg → --ink | text on a soft state tint

## 13. Progress meter (`.meter__fill`: /path hero, the Shell sidebar "Your progress", CoverMap on topic covers)

4920 | .meter__fill | background --hl-mint → --primary | reading-progress fill (precedent: reading progress = --primary)
4921 | .meter__fill | border-right --green → --primary (or delete; a solid fill needs no edge) | fill edge

## 14. Path page steps (/path, app/path/PathClient.tsx)

4952 | .step.is-done | border --green → --success | chapter marked read: done state (precedent: read = --success)
4953 | .step.is-done | background --dg-box-green → --success-soft | done tint

## Counts (80 entries)

KEEP 42 (12 of them DEAD) · primary 15 (8 DEAD) · primary-soft 5 (4 DEAD, including the --ink text line 4457) · mark 2 · success 5 (1 DEAD) · success-soft 3 · danger 3 (1 DEAD) · danger-soft 1 · caution 1 · caution-soft 1 · info-soft 2 (including the --ink text line 4896) · on-primary 0 as a direct swap (but .btn--primary needs one added).

For live rules only: KEEP 30, primary 7, primary-soft 1, mark 2, success 4, success-soft 3, danger 2, danger-soft 1, caution 1, caution-soft 1, info-soft 2.

## KEEP list (exact selectors that stay categorical)

Live:
- `.dg .rd`, `.dg .gr`
- `.boxg`, `.boxr`, `.boxy`, `.lnr`, `.lng`
- `.demo__term .ok` (uncertain, U1)
- `.loop-frame--stack`, `.loop-frame--micro`, `.loop-frame--macro`, `.loop-frame--out`
- `.bx.is-prim`, `.bx.is-ref`
- `.tag--beginner`, `.tag--intermediate`, `.tag--advanced`

Dead (keep only if not deleted):
- `.unit.is-pair`
- `.stat-card--a .stat-card__icon`, `.stat-card--c .stat-card__icon`, `.stat-card--d .stat-card__icon`
- `.badge-card.is-earned`, `.badge-card.is-earned::after`
- `.level-up-banner`
- `.t-yellow`, `.t-mint`, `.t-red`

## Task 2: actions painted with plain --ink (live unless marked)

3867 | .crumbs a | color --ink-soft, border-bottom --line-soft → color --primary, keep the dashed border as the non-colour cue | breadcrumb link (components/Crumbs.tsx)
3873 | .crumbs a:hover | color --ink, border --ink-soft → color --primary, border solid --primary | same; matches chapter.module.css crumbs
3930 | .btn--primary | border-color --ink → --primary | part of the button move (§8)
4689 | .level:hover, .level:focus-visible | border-color --ink → --primary | level card link on /level: hover and focus state
4745 | .level__cta | color --ink → --primary | "Show me this path →" CTA text in the card (the arrow and card are the non-colour cue)
4881 | a.syllabus-item__title (4873 color: inherit) | ink → --primary with an underline at rest (optional) | chapter links in the syllabus; they only underline on hover today (U7)
4991 | a.step__title (4987 color: inherit) | ink → --primary with an underline at rest (optional) | chapter link on planned /path steps (U7)
DEAD: 3406 `.chipbtn.is-on` (ink fill, sheet text → --primary / --on-primary, a selected chip), 3613 `.fld input[type="range"]` (accent-color --ink → --primary), 3955 `.hero__secondary:hover` (a link), 4562 `.topic-row:hover`.
Not CSS: 3272 `.try__run` ("▶ Run this" in chapter try blocks) is a plain `.btn`. If it should read as the primary action, enhancements.ts would need `btn--primary`. I'm noting it here, not recommending it.

## Task 3: text-on-fill pairings after the move

- `.btn--primary` (3928): text inherits `.btn { color: var(--ink) }` (1793), so add `color: var(--on-primary)`. The hover must restate `background: var(--primary)` and `border-color: var(--primary)` over `.btn:hover` (1804-1807). The disabled state isn't used on global routes; mock has its own override in mock.module.css:2228-2246.
- `.tag--done`: text on --success-soft. Use color-mix(success 70%, ink) per precedent, or --ink per the rule. Pure --success on its own soft tint isn't asserted by the contrast test.
- `.tone-yes/-warn/-bad`: mixed role text on the role -soft tint. The contrast test doesn't cover it, so check the dark themes (Night/Blueprint/Rose) or fall back to --ink.
- `.step.is-done`: the children now sit on --success-soft. `.step__sub` (4997) is --pencil, so add `.step.is-done .step__sub { color: var(--ink-soft) }` (--pencil fails on tints). `.step__num` and `.tag` keep their own --sheet-2 fills.
- `.syllabus-checkpoint`: --sticky-mint-fg → --ink on --info-soft.
- `.loop-code div.hot`: the text is --code-fg, not --ink, on --mark. Only mark-vs-ink is asserted; in the nine themes code-fg sits close to ink (spot-checked light, dark, kraft and rose), but it isn't tested.
- `.ev-box--inner`: --ink on --primary-soft is fine as is. `.dom-sandbox p.de-highlight`: ink on --mark is fine.
- `.demo__term .err`: --danger on --code-bg, not --sheet. The dark themes' code-bg is darker than their sheet (so higher contrast) and the light ones are about the same.
- `.crumbs a` → --primary: crumbs sit on --paper, outside `.sheet`, and --primary is only asserted against --sheet.
- `.featured__badge` (DEAD): --ink on --primary-soft.
- Pre-existing, not colour-role: `tbody tr:nth-child(even) td` (3004, specificity 0,1,3) beats `.tone-*` (0,1,0), so tone backgrounds don't show on even table rows. The text colour still applies.

## Routes per family

- Diagrams (§1) and callout boxes (§6): chapter bodies on /notes/[chapter], /dsa/[chapter], /system-design/[chapter], /react/[chapter] (only .bx), /git/[section], /architecture/[chapter] (.dg labels and .bx).
- Run-this terminal (§2): every topic chapter via ReaderShell's enhanceTryBlocks (the `.try` blocks are in content/js and content/dsa), so /notes/[chapter] and /dsa/[chapter]; the js steppers also use `.demo__term dim`.
- DOM/event demos (§3): /notes/[chapter] (dom-events, browser-apis-deep).
- Steppers (§4): /notes/[chapter] (js), /dsa/[chapter] (union-find, sliding-window, graphs traversal), /react/[chapter] (react-fiber).
- Tone cells (§5): /notes/[chapter], /react/[chapter], /architecture/[chapter].
- `.btn--primary` (§8): /path, the 404 page (app/not-found.tsx), the error page (app/error.tsx). /mock overrides it in its module.
- `.tag--*` (§11): /path (LevelTag), /problems/[slug], /practice, /mock room (PracticeWorkspace), /git/[section] (level tags in content/git).
- Syllabus (§12): /level/[topic].
- Meter (§13): /path hero; the Shell sidebar on /path, /level, topic chapters, /soon, 404 and error; the CoverMap on topic covers (/notes, /css, /html, /node, /typescript, /dsa, /react, /system-design and the rest via TopicCoverPage).
- Steps (§14): /path.
- Crumbs (task 2): /path, /level/[topic], /soon, 404, error, and the practice workspace brief.
- §7, §9, §10 and tag--ready: no route (DEAD).

## Uncertain calls

- U1 `.demo__term .ok` and `.loop-frame--out`: all log output is green, so this is terminal decoration, not a pass state. I chose KEEP (like syntax colours) over --success, which would break "states only, never decoration". The alternative is neutral --code-fg, which matches the practice console but changes how it looks.
- U2 `.ev-box--inner` → --primary-soft: it's the demo's clickable target. It could instead stay an illustration on --c-green-soft (KEEP).
- U3 `.loop-code div.hot` → --mark: highlighter on the current line. The alternative is --primary-soft plus an inset --primary bar, which is how chapter.module.css marks the "current item".
- U4 `.tone-*` → success/caution/danger soft: they carry good/bad/careful meaning, but they are content inside chapter tables, and the rules KEEP dry-run tables. I chose states because the epic's categorical list (charts, topic chips, whiteboard, diagrams) doesn't include them. The -soft tints (16%) are noticeably stronger than --dg-box-* (about 5%), so the cells will look heavier.
- U5 `.syllabus-item.is-ready` → --primary: "is-ready" means the chapter is written, not that the reader finished it. --success would make green ✓ mean "written" on /level but "read" on /path (`.step.is-done`), which breaks one meaning per state. The alternative is --success, which keeps today's look.
- U6 `.syllabus-checkpoint` → --info-soft: it's a goal note, not a done state. Alternatives: --success-soft (the ✅ reads as an achievement), or KEEP as a callout-family wash (entry 2 put "callout-family washes" on the categorical list).
- U7 `a.syllabus-item__title` and `a.step__title`: heading-style list links. Moving them to --primary needs an underline at rest (WCAG 1.4.1). Leaving them --ink is defensible.

---

# Classification C — app/globals.css 5000–9575, ReaderShell.tsx markers, narration.ts highlight

Format: `line | selector | old token → new token | reason`.
Lines marked `(pair)` are not theme-blind hits. They are the text or knob colour that has to change with the fill next to them (task 3).
`*` marks an uncertain call (see "Uncertain calls").

---

## 1. Path and reader practice cards (/path, every topic chapter page via PracticeStrip)

5029 | .check input | accent-color var(--green) → var(--success) * | the "mark as read" checkbox on /path; when it is checked, the chapter has been read
5081 | .practice__tick | var(--green) → var(--success) | ✓ shown on a solved exercise card

## 2. Soon stamp (/soon, 404 not-found, error boundary, unwritten chapters in ChapterSheet)

5141 | .soon-stamp | color var(--red) → KEEP * | rotated rubber-stamp illustration, aria-hidden, opacity .85; decoration, not a state
5142 | .soon-stamp | border 3px solid var(--red) → KEEP * | same stamp outline

## 3. Hero highlighter (dead CSS: no consumer of .hero__mark anywhere in the repo)

5375 | .hero__mark::after | background var(--hl-yellow) → var(--mark) | highlighter sweep behind a hero word; delete the rule if it is confirmed dead

## 4. Problem brief, exercise mode (/problems/<slug>, /practice?id=<id>, /mock coding stage)

5721 | .brief__tab:focus-visible | outline var(--green) → var(--primary) | focus ring on the brief's tab
5739 | .brief__count.is-pass | color var(--green) → var(--success) | Tests tab count once every test passes
5740 | .brief__count.is-pass | border mix(var(--green) 50%) → color-mix(in srgb, var(--success) 50%, transparent) | same pass state
5744 | .brief__count.is-fail | color var(--red) → var(--danger) | Tests tab count when any test fails
5745 | .brief__count.is-fail | border mix(var(--red) 50%) → color-mix(in srgb, var(--danger) 50%, transparent) | same fail state
5796 | .hint | background var(--sticky-bg) → KEEP * | hint shown as a rotated sticky note (exercise content)
5797 | .hint | color var(--sticky-fg) → KEEP * | text on the sticky note
9315 | .brief__tests li.is-pass | border-left-color var(--green) → var(--success) | row for a passed test case
9319 | .brief__tests li.is-fail | border-left-color var(--red) → var(--danger) | row for a failed test case
9340 | .is-pass .brief__test-mark | var(--green) → var(--success) | pass glyph
9344 | .is-fail .brief__test-mark | var(--red) → var(--danger) | fail glyph
9350 | .brief__test-why | var(--red) → var(--danger) | why the test failed

## 5. Editor chrome: ed__*, tab menu, select in ed__bar, palette, lint (every workspace route: /practice, /problems/<slug>, /mock)

5903 | .ed__tl--red | background var(--ide-red) → KEEP | macOS window dot
5906 | .ed__tl--yellow | background var(--ide-yellow) → KEEP | window dot
5909 | .ed__tl--green | background var(--ide-green) → KEEP | window dot
5936 | .ed__tab.is-active | border-top var(--ide-accent) → var(--primary) | top bar on the active file tab
5945 | .ed__tab-icon | color var(--ide-accent) → var(--primary) | ◆ file glyph tinted with the accent (aria-hidden)
6066 | .ed__reopen | color var(--ide-bg) → var(--on-primary) (pair) | text on the reopen pill
6067 | .ed__reopen | background var(--ide-accent) → var(--primary) | "↺ Reopen" action pill
6112 | .tab-menu button:hover, :focus-visible | color var(--ide-bg) → var(--on-primary) (pair) | text on the highlighted menu row
6113 | .tab-menu button:hover, :focus-visible | background var(--ide-accent) → var(--primary) * | highlighted row in the tab context menu (a solid fill; primary-soft is the alternative)
6172 | .ed__bar .dd__btn:hover | border-color var(--ide-accent) → var(--primary) | hover on the select button
6176 | .ed__bar .dd.is-open .dd__btn | border-color var(--ide-accent) → var(--primary) | open or active select
6213 | .ed__bar .dd__opt[aria-selected="true"] | background var(--ide-accent) → var(--primary) | selected option in the language or template select
6214 | .ed__bar .dd__opt[aria-selected="true"] | color var(--ide-bg) → var(--on-primary) (pair) | text on the selected option
6219 | .ed__bar .dd__menu--grid .dd__opt[aria-selected="true"] | color var(--ide-accent) → var(--primary) | selected option in the grid picker (text-only cue)
6223 | .ed__bar .dd__opt-check | color var(--ide-accent) → var(--primary) | ✓ beside the selected option
6232 | .ed__bar .dd__opt:focus-visible | outline var(--ide-accent) → var(--primary) | focus ring
6311 | .ed:focus-within | border-color var(--ide-accent) → var(--primary) | editor focus frame
6345 | .ed__ready::before | background var(--ide-green) → var(--success) * | "ready" status dot next to the language label
6346 | .ed__ready::before | box-shadow 0 0 5px var(--ide-green) → var(--success) * | the same dot's glow
6350 | .ed__saved | color var(--ide-green) → var(--success) | "saved" flash, a state
6410 | .ed__problems[data-state="error"] | color var(--ide-red) → var(--danger) | status-bar problem count when there are errors
6487 | .ed__switch input:checked + .ed__switch-track | background var(--ide-accent) → var(--primary) | switch in the on state
6492 | .ed__switch input:checked + .ed__switch-track::after | background var(--ide-bg) → var(--on-primary) (pair) | knob on the primary track
6496 | .ed__switch input:focus-visible + .ed__switch-track | outline var(--ide-accent) → var(--primary) | focus ring
6519 | .ed__seg button[aria-pressed="true"] | color var(--ide-bg) → var(--on-primary) (pair) | text on the pressed segment
6520 | .ed__seg button[aria-pressed="true"] | background var(--ide-accent) → var(--primary) | pressed segment in editor settings
6608 | .palette__item[aria-selected="true"] | background var(--ide-accent) → var(--primary) | selected command-palette row
6609 | .palette__item[aria-selected="true"] | color var(--ide-bg) → var(--on-primary) (pair) | text on it (.palette__group and .palette__keys inherit via currentColor)
6641 | .ed .cm-debug-line | background mix(var(--ide-accent) 22%) → color-mix(in srgb, var(--primary) 22%, transparent) | line the debugger is on (current item)
6642 | .ed .cm-debug-line | box-shadow inset 3px var(--ide-accent) → var(--primary) | gutter bar on the current line
7091 | .ed .cm-inline-result--error | color var(--ide-red) → var(--danger) | inline error result
7117 | .ed .cm-lintRange-error | underline wavy var(--ide-red) → var(--danger) | lint error squiggle
7146 | .ed .cm-diagnosticAction | color var(--ide-bg) → var(--on-primary) (pair) | text on the diagnostic action button
7147 | .ed .cm-diagnosticAction | background var(--ide-accent) → var(--primary) | quick-fix action button in the lint tooltip

## 6. Workspace top bar (lc-topbar: every workspace route; Run in both modes, Test in exercise mode only)

6239 | .lc-topbar .btn--run, .lc-topbar .btn--test | color var(--ide-bg) → var(--on-primary) (pair) | text on both action buttons
6247 | .lc-topbar .btn--run | background var(--ide-green) → var(--primary) * | Run is the primary action, not a success state
6248 | .lc-topbar .btn--run | border-color var(--ide-green) → var(--primary) | same
6252 | .lc-topbar .btn--test | background var(--ide-accent) → var(--primary) | Test/Submit is the primary action
6253 | .lc-topbar .btn--test | border-color var(--ide-accent) → var(--primary) | same
6263 | .lc-topbar .btn--run:hover:not(:disabled) | box-shadow mix(var(--ide-green) 70%) → color-mix(in srgb, var(--primary) 70%, transparent) | hover glow
6268 | .lc-topbar .btn--test:hover | box-shadow mix(var(--ide-accent) 70%) → color-mix(in srgb, var(--primary) 70%, transparent) | hover glow
9063 | .lc-icon-btn:focus-visible | outline var(--ide-accent) → var(--primary) | focus ring on the top-bar icon buttons

## 7. Debugger and value viewer (DebugPanel: every workspace route)

6681 | .debug__btn--main | color var(--ide-bg) → var(--on-primary) (pair) | text on the main step button
6682 | .debug__btn--main | background var(--ide-accent) → var(--primary) | main play/step button
6683 | .debug__btn--main | border-color var(--ide-accent) → var(--primary) | same
6689 | .debug__slider | accent-color var(--ide-accent) → var(--primary) | step scrubber, a form control
6728 | .debug__var[data-changed] | background mix(var(--ide-accent) 14%) → color-mix(in srgb, var(--primary) 14%, transparent) * | highlight on a variable that changed this step
6729 | .debug__var[data-changed] | border-color mix(var(--ide-accent) 45%) → color-mix(in srgb, var(--primary) 45%, transparent) * | same
6874 | .dv-list__arrow | color var(--ide-accent) → var(--primary) * | → between linked-list nodes in the value viewer
6902 | .dv-tree__v | border 1.5px solid var(--ide-accent) → var(--primary) * | tree-node bubble in the value viewer

## 8. Output panel: tabs, console, tests, verdict, problems, history, stdin (/practice, /problems/<slug>, /mock; runs and stdin are /practice only)

6957 | .stdin__box:focus-visible | outline var(--ide-accent) → var(--primary) | focus ring (/practice only)
6977 | .run[data-ok="true"] .run__mark | color var(--ide-green) → var(--success) | run history: the run passed (/practice)
6981 | .run[data-ok="false"] .run__mark | color var(--ide-red) → var(--danger) | run history: the run failed
7055 | .problem[data-severity="error"] .problem__mark | color var(--ide-red) → var(--danger) | lint error in the Problems tab
7267 | .tab__count.is-pass | background mix(var(--ide-green) 18%) → color-mix(in srgb, var(--success) 18%, transparent) | Tests tab badge, all passed
7268 | .tab__count.is-pass | color var(--ide-green) → var(--success) | same; see pairing note P3
7272 | .tab__count.is-fail | background mix(var(--ide-red) 18%) → color-mix(in srgb, var(--danger) 18%, transparent) | Tests or Problems badge when failing or erroring
7273 | .tab__count.is-fail | color var(--ide-red) → var(--danger) | same; see P3
7332 | .line--error | color var(--ide-red) → var(--danger) | console.error line
7336 | .line--warn | color var(--ide-yellow) → var(--caution) | console.warn line
7340 | .line--info | color var(--ide-accent) → var(--info) | console.info line (a note, not an action)
7423 | .test--pass .test__mark | color var(--ide-green) → var(--success) | passed test
7427 | .test--fail .test__mark | color var(--ide-red) → var(--danger) | failed test
7440 | .test__why | color var(--ide-red) → var(--danger) | failure message
7454 | .verdict--pass | background mix(var(--ide-green) 13%) → color-mix(in srgb, var(--success) 13%, transparent) | "all tests pass" banner
7455 | .verdict--pass | color var(--ide-green) → var(--success) | 24px banner text; see P3
7459 | .verdict--fail | background mix(var(--ide-red) 10%) → color-mix(in srgb, var(--danger) 10%, transparent) | failing banner
7460 | .verdict--fail | color var(--ide-red) → var(--danger) | banner text; see P3
7461 | .verdict--fail | border-left 4px var(--ide-red) → var(--danger) | banner stripe
7695 | .run-status[data-state="ok"] | color var(--ide-green) → var(--success) | run-status pill "ok" (/practice)
7696 | .run-status[data-state="ok"] | background mix(var(--ide-green) 15%) → color-mix(in srgb, var(--success) 15%, transparent) | same
7700 | .run-status[data-state="error"] | color var(--ide-red) → var(--danger) | run-status pill "error"
7701 | .run-status[data-state="error"] | background mix(var(--ide-red) 15%) → color-mix(in srgb, var(--danger) 15%, transparent) | same

## 9. Playground top bar (/practice only)

7110 | .live-btn[aria-pressed="true"] | color var(--ide-bg) → var(--on-primary) (pair) | text on the pressed Live toggle
7111 | .live-btn[aria-pressed="true"] | background var(--ide-accent) → var(--primary) | Live preview toggle, pressed
7112 | .live-btn[aria-pressed="true"] | border-color var(--ide-accent) → var(--primary) | same
7587 | .pg-lang[aria-pressed="true"] | color var(--ide-bg) → var(--on-primary) (pair) | text on the current quick-language button
7588 | .pg-lang[aria-pressed="true"] | background var(--ide-accent) → var(--primary) | current language (selected)
7622 | .pg-more.is-current .dd__btn | color var(--ide-bg) → var(--on-primary) (pair) | text on the "more languages" button when one of them is current
7623 | .pg-more.is-current .dd__btn | background var(--ide-accent) → var(--primary) | current language picked from the overflow list

## 10. New-file dialog language picker (FileDialogs, /practice only)

9266 | .lang-pick__opt[aria-checked="true"] | border-color var(--green) → var(--primary) | selected language (a selected state)
9267 | .lang-pick__opt[aria-checked="true"] | background mix(var(--green) 10%, var(--sheet-2)) → color-mix(in srgb, var(--primary) 10%, var(--sheet-2)) | selected tint; text stays --ink
9271 | .lang-pick__opt:focus-visible | outline var(--green) → var(--primary) | focus ring

## 11. Array and grid visualisers in chapter bodies (/notes/<ch>: closures, prototypes-oop, in-the-browser, setup-mental-model; /dsa/<ch>: two-pointers, sliding-window, binary-search, union-find, monotonic-stack-queue, dp-2d, heaps)

8042 | .viz__cell--lo | border-color var(--green) → KEEP | diagram cell: low pointer
8043 | .viz__cell--lo | background var(--dg-box-green) → KEEP | diagram box
8046 | .viz__cell--hi | border-color var(--red) → KEEP | diagram cell: high pointer
8047 | .viz__cell--hi | background var(--dg-box-red) → KEEP | diagram box
8051 | .viz__cell--mid, .viz__cell--hot | border-color var(--dg-yellow-stroke) → KEEP | diagram cell: mid or hot
8052 | .viz__cell--mid, .viz__cell--hot | background var(--dg-box-yellow) → KEEP | diagram box
8062 | .viz__cell--done | border-color var(--green) → KEEP | a finished cell inside the diagram (categorical, not app state)
8063 | .viz__cell--done | color var(--green) → KEEP | same
8090 | .viz__gcell--hot | border-color var(--dg-yellow-stroke) → KEEP | DP-grid cell being filled
8091 | .viz__gcell--hot | background var(--dg-box-yellow) → KEEP | same
8098 | .viz__gcell--done | color var(--green) → KEEP | DP-grid cell that is filled
8099 | .viz__gcell--done | border-color var(--green) → KEEP | same

## 12. Problem list (dead CSS: no consumer of .prob*, .btn--chip or .prob-list in the repo)

8192 | .prob__tick | color var(--green) → var(--success) | solved tick; delete the rule if it is confirmed dead

## 13. Interview book body (/interview/<chapter>, /mock rounds via Room)

8356 | .interview-body .tier.hot | background var(--sticky-mint-bg) → KEEP * | company-tier chip marking where the round is common (content chip)
8357 | .interview-body .tier.hot | color var(--sticky-mint-fg) → KEEP * | same
8424 | .interview-body .test | border-left 2.5px var(--hl-yellow) → var(--mark) * | highlighter stripe on the "What they are really testing" callout
8484 | .interview-body .prep | background var(--dg-box-green) → KEEP | "prep" callout box (content)
8485 | .interview-body .prep | border 1.5px var(--green) → KEEP | same
8494 | .interview-body .prep .ttl | color var(--green) → KEEP | callout title
8541 | .interview-body pre .o | background var(--hl-yellow) → var(--mark) | highlighted fragment inside a code sample (43 uses, e.g. "the case people miss")
8553 | .interview-body tr.hi td | background var(--sticky-mint-bg) → KEEP | highlighted row in a content table (salary/offer tables)
8554 | .interview-body tr.hi td | color var(--sticky-mint-fg) → KEEP | same
8573 | .interview-body .card.g | background var(--dg-box-green) → KEEP | content card
8577 | .interview-body .card.r | background var(--dg-box-red) → KEEP | content card
8581 | .interview-body .card.y | background var(--dg-box-yellow) → KEEP | content card
8613 | .interview-body .pill.y | background var(--sticky-bg) → KEEP * | content pill ("floor")
8614 | .interview-body .pill.y | color var(--sticky-fg) → KEEP * | same
8618 | .interview-body .pill.m | background var(--sticky-mint-bg) → KEEP * | content pill ("accept", "target", "your domain")
8619 | .interview-body .pill.m | color var(--sticky-mint-fg) → KEEP * | same
8624 | .interview-body .pill.r | color var(--red) → KEEP * | content pill ("reject")
8625 | .interview-body .pill.r | border 1px var(--red) → KEEP * | same

## 14. 3D closure scopes (/notes/closures)

8685 | .c3d__plane.is-kept | background var(--dg-box-green) → KEEP | diagram plane: scope kept alive
8686 | .c3d__plane.is-kept | border-color var(--green) → KEEP | same
8690 | .c3d__plane.is-hot | background var(--dg-box-yellow) → KEEP | diagram plane: scope running
8691 | .c3d__plane.is-hot | border-color var(--dg-yellow-stroke) → KEEP | same
8724 | .c3d__badge | background var(--hl-mint) → KEEP | badge inside the diagram
8725 | .c3d__badge | color var(--sticky-mint-fg) → KEEP | same
8733 | .c3d__link | background var(--green) → KEEP | scope-chain link in the diagram

## 15. React, lifecycle and graph visualisers (/react/<ch>: fiber, memoisation, effect-timing, suspense, server-components; /dsa/graphs-representation-traversal)

8824 | .viz-node.is-current | background var(--hl-yellow) → var(--mark) * | highlighter behind the node being rendered (text is --ink)
8830 | .viz-node.is-done | border-color var(--green) → KEEP | diagram node done (categorical)
8844 | @keyframes viz-flash from | background var(--hl-yellow) → var(--mark) * | flash when a node re-renders (must match 8824)
8854 | .viz-node.is-rendered (reduced motion) | background var(--hl-yellow) → var(--mark) * | the flash's static fallback
8863 | .viz-badge | border 1px var(--green) → KEEP | diagram badge ("reused", etc.)
8864 | .viz-badge | background var(--dg-box-green) → KEEP | same
8865 | .viz-badge | color var(--green) → KEEP | same
8869 | .viz-badge--work | border-color var(--red) → KEEP | diagram badge ("work")
8870 | .viz-badge--work | background var(--dg-box-red) → KEEP | same
8871 | .viz-badge--work | color var(--red) → KEEP | same
8903 | .viz-phase.is-current | background var(--hl-yellow) → var(--mark) * | the current lifecycle phase
8911 | .viz-phase.is-yours::after | color var(--red) → KEEP | "your effect runs here" diagram annotation
8938 | .viz-rect--server | fill var(--dg-box-yellow) → KEEP | server box, SVG diagram
8939 | .viz-rect--server | stroke var(--dg-yellow-stroke) → KEEP | same
8943 | .viz-rect--client | fill var(--dg-box-green) → KEEP | client box, SVG diagram
8944 | .viz-rect--client | stroke var(--green) → KEEP | same
8983 | .viz-vertex.is-visited circle | fill var(--dg-box-green) → KEEP | graph traversal: visited vertex
8984 | .viz-vertex.is-visited circle | stroke var(--green) → KEEP | same
8988 | .viz-vertex.is-current circle | fill var(--hl-yellow) → var(--mark) * | graph traversal: current vertex (label fill is --ink)

## 16. Page-head back button (/progress, /review via PageFrame; /mock; /interview via BookShell)

9565 | .head-back:focus-visible | outline var(--c-green) → var(--primary) | focus ring

## 17. Other files

components/reader/ReaderShell.tsx:239 | marker#arrow-green path | fill var(--green) → KEEP (or var(--c-green)) | diagram arrowhead that pairs with the .lng stroke (globals.css:3094, var(--green)); must match that stroke
components/reader/ReaderShell.tsx:250 | marker#arrow-red path | fill var(--red) → KEEP (or var(--c-red)) | pairs with the .lnr stroke (globals.css:3088); used by content/js, content/git and content/architecture diagrams
components/reader/narration.ts:131 | ::highlight(narration) | background-color var(--hl-yellow) → var(--mark) | the highlighter that follows the word being read aloud; text keeps its own colour (--ink in the body)

Note: components/series/ChapterView.tsx:46-47 defines the same arrow-green and arrow-red markers for /architecture and /git. It is outside this range but must get the same decision as ReaderShell.

---

## Task 2 — actions painted with plain ink that should take the accent (this range only)

1. 5714–5717 | .brief__tab.is-active | border-bottom-color var(--ink) → var(--primary) | active tab underline in the problem brief; text can stay --ink (/problems/<slug>, /practice?id=, /mock)
2. 5849–5857 | .resize-handle:focus-visible .resize-handle__grip | background var(--ink-soft) → var(--primary) | the grip is the only focus cue (5856 sets outline: none); split the focus-visible selector off from :hover, which can stay --ink-soft (workspace routes)
3. 8769 | .c3d-ctl input[type="range"] | accent-color var(--ink) → var(--primary) | a form-control slider (not diagram paint) under the closures 3D diagram (/notes/closures)
4. 5238–5240 | .site-foot a | color var(--ink-soft) → var(--primary) (low priority) | footer links on /path, /soon and /level/<topic>; the underline stays (no text-decoration override)
5. 7251–7256 | .tab.is-active | no accent at all (--ide-fg on --ide-bg with a border) → optionally add an inset bottom bar or border in var(--primary) * | active output-panel tab; ed__tab.is-active already carries the accent
6. Dead CSS (no consumers), for completeness: 8123–8127 .btn--chip.is-on (var(--ink) fill + var(--sheet) text → var(--primary) + var(--on-primary)); 5463 .shelf-search input:focus (border var(--ink-soft) with outline: none → var(--primary)); 8178 .prob__title:hover underline var(--ink-soft)
7. Missing focus ring rather than an ink colour: 6649 `.debug { outline: none }` is a focusable panel with no :focus-visible style; 6586 `.palette__input { outline: none }` (autofocused in a modal, so less important). Either could get a var(--primary) ring.

## Task 3 — text on fills after the move

- P1 (becomes --on-primary). Every solid accent fill in this range uses var(--ide-bg) (= --sheet-2) for its text. All of these must switch to var(--on-primary): 6066 .ed__reopen, 6112 .tab-menu hover, 6214 .dd__opt selected, 6239 .btn--run/.btn--test, 6519 .ed__seg pressed, 6609 .palette__item selected, 6681 .debug__btn--main, 7110 .live-btn pressed, 7146 .cm-diagnosticAction, 7587 .pg-lang pressed, 7622 .pg-more.is-current. This matters most in mono (--primary #161616 needs --on-primary #fff) and in dark, blueprint and rose (light --primary needs dark text). --ide-bg is wrong there.
- P2 (knob, not text). 6492 .ed__switch knob var(--ide-bg) on the checked primary track → var(--on-primary), for 3:1 non-text contrast.
- P3 (state text on its own state tint). .tab__count.is-pass/.is-fail (7267–7273, 11.5px), .run-status[data-state] (7695–7701, 12px) and .verdict--pass/--fail (7454–7461, 24px bold) all put role-coloured text on an 10–18% mix of the same role. Rule 7 says text on a state -soft tint is --ink. Either keep role text and check it reaches 4.5:1 for the small badges (3:1 is enough for the 24px verdict) in all nine themes, or switch those badges to var(--ink) text and let the tint plus the ✓/✗ glyph carry the state.
- P4. .brief__count.is-pass/.is-fail (5739–5745) is role text on --sheet-2 with a role border, so it needs --success and --danger to be text-safe on --sheet-2. The same holds for .run__mark, .test__mark, .test__why, .line--error/warn/info and .brief__test-why on --ide-bg or --sheet-2.
- P5. .ed__bar .dd__menu--grid .dd__opt[aria-selected] (6219) makes --primary the only cue, as text on --ide-bg-elevated (= --sheet), so --primary must be text-safe on --sheet (it should be, since it is the link colour).
- P6 (--mark pairings). Every --mark fill keeps --ink text: viz-node.is-current, viz-phase.is-current, viz-vertex.is-current (the label's fill is --ink) and hero__mark. For narration.ts, ::highlight only sets a background, so text keeps its own colour; that is --sticky-fg if narration crosses a sticky note. For .interview-body pre .o, the text is code or syntax colour on --mark; check it in dark, blueprint and rose, where --mark is opaque (#4a4020, #5a5a2c, #5c2a44) instead of today's translucent hl-yellow.
- P7. .lang-pick__opt[aria-checked] keeps var(--ink) text on color-mix(--primary 10%, --sheet-2), which is fine by rule 5. .debug__var[data-changed] and .cm-debug-line put ide-fg or syntax-coloured code on a 14% or 22% --primary tint; check syntax colours on the 22% band, or drop it to var(--primary-soft).

---

## KEEP list (exact selectors that stay categorical)

- .ed__tl--red, .ed__tl--yellow, .ed__tl--green (window dots)
- .soon-stamp *
- .hint *
- .viz__cell--lo, .viz__cell--hi, .viz__cell--mid, .viz__cell--hot, .viz__cell--done
- .viz__gcell--hot, .viz__gcell--done
- .interview-body .tier.hot *
- .interview-body .prep, .interview-body .prep .ttl
- .interview-body tr.hi td
- .interview-body .card.g, .interview-body .card.r, .interview-body .card.y
- .interview-body .pill.y, .interview-body .pill.m, .interview-body .pill.r *
- .c3d__plane.is-kept, .c3d__plane.is-hot, .c3d__badge, .c3d__link
- .viz-node.is-done
- .viz-badge, .viz-badge--work
- .viz-phase.is-yours::after
- .viz-rect--server, .viz-rect--client
- .viz-vertex.is-visited circle
- ReaderShell.tsx marker#arrow-green, marker#arrow-red (optionally renamed to --c-green and --c-red, with the .lng/.lnr strokes and ChapterView.tsx:46-47 changed to match)

Not guard tokens, but categorical and staying as they are: the syntax colours (.tok-*, .dv-prim--*), and .page-preview `background: white`, .preview-panel__host `#fff` and .preview-frame `#fff` (9007, 9020), which are a deliberate browser-default canvas for the user's HTML. Nearby: `.preview-panel__host .panel__empty { color: #5b616e }` (9012) is a hard-coded --pencil on that white canvas, and `.hero__doodle--spark { color: #d8a72c }` (5313) is a hard-coded hex in what looks like dead hero CSS.

## Routes per family

- Path and practice cards: /path; every topic chapter page (/notes/<ch>, /dsa/<ch>, /react/<ch>, /css/<ch>, …) through PracticeStrip in ChapterSheet
- Soon stamp: /soon, the 404 page, the error boundary (app/error.tsx), unwritten chapters in any topic reader
- hero__mark, prob__*, btn--chip, shelf-search: no route (dead)
- Problem brief (.brief*, .hint): /problems/<slug>, /practice?id=<id>, /mock (coding stage, `interview` prop)
- Editor chrome, lc-topbar, debugger, output panel (shared): /practice, /problems/<slug>, /mock
- Playground only (pg-*, live-btn, run-status, .runs/.run, .stdin, lang-pick, lc-topbar--playground): /practice
- Exercise only (btn--test, .verdict, .test*, preview-panel): /problems/<slug>, /practice?id=, /mock
- viz__cell and viz__gcell: /notes/{closures, prototypes-oop, in-the-browser, setup-mental-model}; /dsa/{two-pointers, sliding-window, binary-search, union-find, monotonic-stack-queue, dp-2d, heaps-priority-queues}
- c3d: /notes/closures
- viz-node, viz-badge, viz-phase, viz-rect: /react/{fiber, memoisation, effect-timing, suspense, server-components}
- viz-vertex: /dsa/graphs-representation-traversal
- interview-body: /interview/<chapter>, /mock (rounds in Room)
- head-back: /progress, /review, /mock, /interview
- ReaderShell markers and narration highlight: every topic chapter reader (topicPages → ReaderShell); the markers are drawn by content/js, content/git and content/architecture diagrams (git and architecture get them from ChapterView)

## Uncertain calls

1. 5029 .check input → --success. It is a control, so --primary (selected state) is defensible, but checked means "read", which rule 7 lists as a state.
2. 5141–5142 .soon-stamp → KEEP as an illustration (rotated, aria-hidden, decorative). The alternative is --danger for "404" and "error", or --caution for "not written yet". Rule 7 forbids state tokens as decoration.
3. 5796–5797 .hint → KEEP as a sticky note. The alternative is --info-soft with --ink text, since a hint is a "tip". It lives in the workspace brief, not a chapter body, which is why this call is uncertain.
4. 6113 .tab-menu hover, and the solid selected rows (6213 dd__opt, 6608 palette__item) → solid --primary with --on-primary, keeping today's design. Rule 5 lists "hovers, selected rows" under --primary-soft with --ink. If --primary-soft is chosen, the P1 pairings for those three become --ink.
5. 6345–6346 .ed__ready::before → --success. It never changes state (always on), so it is close to decoration; --primary or KEEP are the alternatives.
6. 6247 .btn--run and 6252 .btn--test both → --primary. That gives two identical primary buttons side by side, which is also true today (both green). Consider making Run the secondary one. That is a design question, not a token one.
7. 6728–6729 .debug__var[data-changed] → --primary mix. --mark (a highlighter on the changed value) fits too.
8. 6874 .dv-list__arrow and 6902 .dv-tree__v → --primary, treating them as debugger chrome. KEEP applies if they count as diagrams.
9. 8424 .interview-body .test border-left → --mark as a highlighter stroke per rule 6. KEEP is the alternative, as a content callout.
10. 8824, 8844, 8854, 8903 and 8988 (viz "current" highlights on --hl-yellow) → --mark, because rule 6 moves hl-yellow in its highlighter role. KEEP is the alternative, as diagram paint. If kept, dark themes keep the translucent hl-yellow.
11. 8613–8625 .interview-body .pill.y/.m/.r → KEEP as content. They read as floor/accept/reject, so --caution-soft, --success-soft and --danger-soft (with --ink text) would also be defensible.
12. 8356–8357 .interview-body .tier.hot → KEEP. --primary-soft with --ink is the alternative (a highlighted or "current" chip).
13. Outside the guard list but semantically wrong: warnings are painted with the syntax string colour var(--ide-string) at 6414 `.ed__problems[data-state="warning"]`, 7059 `.problem[data-severity="warning"] .problem__mark` and 7124 `.ed .cm-lintRange-warning`. They should become var(--caution), to match .line--warn.
14. 7340 .line--info → --info, not --primary: it is a console.info note, not an action.
15. Dead CSS classified anyway: .hero__mark, .prob__tick, .btn--chip, .prob__title, .shelf-search (plus .hero__doodle and .howto-strip, which have no guard hits). The refactor could delete them instead.
