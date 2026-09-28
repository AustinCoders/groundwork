# Roadmap analysis, 28 Sep 2026

Analysis of `docs/roadmap.html` (artifact https://claude.ai/artifact/AePbE6jq1obbqeD9vWkkiC, version 6) after it was updated from this audit.

## Where it stands

99 tasks in 11 phases: **24 done (24%)**, 3 in progress, 1 blocked, 71 to do. Estimated work left is **44–65 days**, plus 19 tasks with no estimate, almost all of them topics to write.

| # | Phase | Done | Doing | Blocked | To do | Days left | Unestimated |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Fix first | 11 | – | – | – | 0 | – |
| 2 | Shipped outside the plan (new) | 12 | – | – | – | 0 | – |
| 3 | Audit fixes (new) | – | – | – | 12 | 3.8–4.3 | – |
| 4 | Redesign every topic page (new) | – | – | – | 10 | 9–13 | – |
| 5 | Fast on phones (new) | – | – | – | 8 | 4.5–5.8 | – |
| 6 | One system underneath (new) | – | – | – | 8 | 10.5–18.5 | – |
| 7 | Grow the audience | – | 2 | 1 | 9 | 5.4–7.4 | – |
| 8 | Close the practice gaps | 1 | 1 | – | 2 | 3.5–4.5 | – |
| 9 | Write next | – | – | – | 8 | 0.5 | 7 |
| 10 | Topic backlog | – | – | – | 10 | 0 | 10 |
| 11 | Later | – | – | – | 4 | 7–11 | 2 |

Open work by area: Content 22, Quality 8, Design 8, Performance 8, SEO 7, Product 6, Infra 4, Growth 4, Data 3, Privacy 2, A11y 2, Security 1.

## What changed in this update

- **New phases:** Shipped outside the plan, Audit fixes, Redesign every topic page, Fast on phones, One system underneath.
- **12 shipped items recorded:** 83 commits and about 56k lines landed after the last tick without a task.
- **43 new tasks** (t45–t87), each citing its audit finding.
- **Status corrections:**
  - t22 is done; the first audit's count was wrong.
  - t17, t20 and t23 are in progress.
  - t21 is blocked.
- **Notes:**
  - t01 now points at t45, the privacy regression.
  - t24 is re-scoped to the sections that really are thin.
  - t06 and t25 say 18 chapters.
  - t38–t40 note the size gap with `docs/ROADMAP.md`.
  - t44 notes the conflict with the FAQ.
- **New areas:** Design, Performance, A11y, Quality and Security.

## Findings

1. **The roadmap stopped describing the work.** Every task outside "Fix first" was still to do, while the mock interview, playground, whiteboard, Git guide, How this is built, interview book, homepage, Review and Progress all shipped. Real effort went to product and UI, not to the "Grow the audience" phase that was next in line. Tracking stories in BMad tickets closes this gap, as long as each finished story also ticks its roadmap task.

2. **Content is the largest and least planned part.** 14 of 21 topics have nothing written (358 outline chapters), plus three new tracks from `docs/ROADMAP.md` (AI engineering, System Design frontend and GenAI, three interview rounds). None of the 19 writing tasks has an estimate, so "44–65 days" understates what's left by a wide margin. At the depth of today's chapters (1,100–3,000 words each), TypeScript and Next.js alone are 58 chapters.

3. **The next month is engineering, and it holds together.** Audit fixes, the topic redesign, performance and the system work add up to about 28–41 days. They overlap in code, so the order matters:
   - TP-1 (topic frame) is the first step of t75 (one site frame).
   - TP-9 (delete the old Shell) removes a large part of what t76 (split `globals.css`) and t69 (render-blocking CSS) would otherwise touch.
   - TP-7 (path page) fixes half of perf P1; t67 fixes the other half.
   - t82 (one storage layer) has to come before t16 (progress export).

4. **Some tasks contradict the site or its policy:**
   - **t44** (paid interview book) contradicts the FAQ: "There is no paid tier hiding the good parts."
   - **t12** (newsletter, notify me) and **t43** (accounts) need a backend. AGENTS.md describes the site as having none, and the privacy copy (t46) would have to change.
   - **t38–t40** plan 22, 21 and 24 chapters for GraphQL, Redis and Kubernetes. `docs/ROADMAP.md` plans about 6, 12 and 8.

5. **Some tasks need you, not code:**
   - t54: Sentry DSN on Vercel.
   - t55: sitemap submission.
   - t44: the paid-tier decision.
   - TP-9: whether the daily recap, clock and streak widgets survive.
   - t38–t40: which chapter counts are right.

6. **`docs/ROADMAP.md` has drifted.** It still says 194 written chapters, Git 16 and 230 questions. Its P0 items only reached this page today (t83–t85). t50 covers refreshing it; after that, the page's Export Markdown should be the one way it gets updated.

7. **Effort parsing has one trap.** The page reads "30 min" as 30 days, because it has no minute unit. Write efforts in hrs, day or days.

## Recommended order

This is the order the BMad ticket tree in `_bmad-output/initiative-groundwork-overhaul/` enforces. Each later epic edits files the earlier one changes first.

1. **Audit fixes** (about 4 days, epic 1). Start with the privacy fix (1.1), the keyboard traps (1.2) and the a11y suite (1.3). The question count (1.8) waits on your answer.
2. **Topic redesign, TP-0 to TP-9** (9–13 days, epic 2). One story per session with `bmad-build`, starting with the shared frame on `/notes` (2.1). The routing fixes (2.2) run beside it.
3. **Fast on phones** (about 5 days, epic 3). The Playground, mock-room and font wins (t67, t68, t72) depend only on epic 1. When epic 3 is incepted they can be pinned that way and pulled ahead of the redesign, if the quick Lighthouse gain matters more. The CSS, Radix, scroll-effect and prefetch work waits for Shell to be deleted (2.10).
4. **One system underneath** (10–18 days, epic 4). The rest of the site moves onto the final frame, then `globals.css`, the token scale, the CSP and the tests.
5. **Then choose between growth and writing.** Growth tasks are cheap (5–7 days), but most need a backend decision first. Writing is where the site's promise lives: pick TypeScript and Next.js (P0), size them, and give them estimates.
