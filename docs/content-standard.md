# Content standard

The bar for every chapter on Groundwork, written after a full review of 216 chapters (average 6.8 out of 10, DSA 8.1). The review scored six dimensions; a chapter that meets all of the points below scores in the 9s. A 10 means best in class anywhere, so treat 8.5 to 9 as the real target.

## Length and tokens

- 3,500 to 5,000 words of prose (code, tables of code and figures do not count), at most 6,000. Longer chapters are split in two.
- Outline first: the section list with one line each, then the body.
- Agents: at most 5 or 6 at a time. Use a cheaper model for wiring, formatting and exercise typing, and the stronger model for theory and review. Give an agent a short brief that points at this file instead of pasting it.
- Review only what changed, and only what running code cannot catch (theory, proofs, prose, tables, figures, the new quiz questions). The author runs the code.
- Merge agent work with one script and an explicit list of files per group; never loop over groups that share files.

## The six dimensions

| Dimension       | A chapter meets it when                                                                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Depth (25%)     | It covers what its level promises, derives the idea instead of stating it, shows why, edge cases and trade-offs, has one hand-traced worked example (a dry-run table), gives complexity with the reason, and lists the pitfalls.       |
| Accuracy (25%)  | Every code block runs and every annotated output matches; every number, version and API claim is current for 2026; no "always", "never" or "only" without a proof; complexities are the tightest correct bound; exponents use `<sup>`. |
| Clarity (15%)   | Plain step-by-step writing with good examples; no placeholders; no concept used before it is taught; chapter and exercise counts come from data, never typed.                                                                          |
| Practice (15%)  | Graded exercises with tests (6 or more, edge cases included, 3 hints) or a drill with an answer key, and a 5-question self-check with a pass mark. A chapter with no practice scores 0 here.                                           |
| Visuals (10%)   | A diagram or visualiser wherever a picture explains: data flow, timeline, state machine, tree. Use the figure classes existing chapters use.                                                                                           |
| Interview (10%) | 3 to 5 real questions with model answers and one trap; every follow-up has a written answer of 3 to 5 lines; "say it like this" scripts; recognition cues.                                                                             |

## Template

Every chapter has: subtitle, prerequisites, read time, the sections above, "Before you move on" bullets, a self-check, and its interview block. Pages on the old template (no read time, no self-check) are migrated before anything else.

## Checks that enforce it

- `tests/chapter-standards.test.ts`: the word limit, and that DSA code blocks parse (older long chapters and unparsed blocks are recorded in `tests/chapter-standards-baseline.ts`; the baselines may only shrink).
- `tests/claims.test.ts`: the numbers in the "How this is built" chapters. `npm run claims:sync` rewrites them.
- `tests/dsa-quiz.test.ts` and `tests/dsa-curriculum.test.ts`: pool integrity, the depth bar, prerequisites.
- `npm run check` runs all of them; run it and the production build before any push.

## Adding a chapter

1. Stub in the topic's notes file with id, num, title, short, levels, prerequisites.
2. Chapter file, quiz pool, exercises file; register them (`content/<topic>-notes.ts`, `lib/quizPool.ts`, `content/practice/dsa.ts`) and add the syllabus entry in `content/topics.ts`.
3. `npm run claims:sync`, then `npm run check` and `npm run build`.
