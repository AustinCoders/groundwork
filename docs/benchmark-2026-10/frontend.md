# Benchmark: JavaScript, React and the Frontend Interview Book

Area: Groundwork topics `js` (41 chapters), `react` (57), `architecture` (26), the interview book (`content/interview-data.ts`, 27 rounds), and the `js` and `react` exercises.
Competitors: javascript.info, MDN JavaScript Guide, react.dev (Learn and Reference), GreatFrontEnd (public pages only), Frontend Interview Handbook (FIH).
Date of work: 2026-10-21. Repo read from `/Users/akshat/Desktop/groundwork`. No repo file was edited.

Labels: OBSERVED = I read it or ran it. INFERRED = I concluded it from what I observed.

---

## Summary verdict

Is Groundwork's JS and React data top notch? In places yes, as a whole no.

- **Accuracy and freshness are genuinely strong. OBSERVED.** I ran every reference solution for all 99 JS and 162 React exercises against their own tests: 261 of 261 pass, all 2,098 tests. No starter code passes its tests. I ran the 18 React output drills I could run in real React: all 18 match the book's answers. I ran the 20 JS drills in Node: all match. Time-sensitive claims (React 19.2 `useEffectEvent`, the December 2025 React2Shell CVEs, Next 16 caching, Temporal) check out against secondary sources.
- **It is not better than the big players overall.** It is ahead of javascript.info and MDN on freshness and on practice (they have almost no tests or runnable exercises). It is level with them on JS depth. It is behind react.dev on React teaching depth, live examples and trust. It is well behind GreatFrontEnd on interview practice volume, solution write-ups, frontend system design and UI-coding breadth.
- **Four structural problems.**
  1. React chapters average 862 prose words and JS chapters 1,475. The site's own standard says 3,500 to 5,000. Neither topic has been audited (audits exist only for DSA and system design).
  2. There are zero quizzes or self-check pools for JS or React.
  3. Citations are near zero: 3 external links in 98 chapters, one of them a placeholder.
  4. The interview book's 613 follow-ups are bare prompts with no written answer, against the site's own rule that every follow-up gets 3 to 5 lines.
- **Headline numbers are inflated.** The 26 `architecture` chapters document Groundwork itself. They are not frontend learning content, and no competitor has an equivalent.

## Scope and method

What I measured, and with what.

| Item                           | Method                                                                                                                                                                                                                                       | Result (OBSERVED)                                                                                                                                                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chapter counts and prose words | `npx tsx` script importing `lib/content.ts`; prose = body with `<pre>`, `<script>`, `<style>`, `<svg>` removed (same rule as `minutesFor`)                                                                                                   | js 41 ch, 60,499 words; react 57 ch, 49,134; architecture 26 ch, 41,219; interview 27 rounds, 69,944                                                                                                                    |
| Per-chapter word spread        | same script                                                                                                                                                                                                                                  | js mean 1,475 (min 890, max 2,784, excluding the interview-bank chapter at 2,501); react mean 862 (min 544; the 3,550 interview-bank chapter is the outlier)                                                            |
| Exercise correctness           | Ran `solution` against every `tests[].body`. JS: Node `AsyncFunction`, plus `assertKit.ts`. React: the site's own built `public/wasm/react-sandbox.js` loaded in headless Chromium via Playwright, source composed with `lib/reactSource.ts` | JS 99/99 solutions pass (880 tests). React 162/162 pass (1,218 tests). Starters: 0 of 261 pass every test. Mean share of tests a starter passes: JS 6.1%, React 21.1%                                                   |
| React output drills            | Wrote the 20 snippets from `react-interview-bank` as real components and ran them in the same Chromium harness                                                                                                                               | 18 of 20 reproduced exactly as the book states. The other 2 (drills 5 and 16) are Strict Mode double-invocation, which only happens in a development build. The sandbox is a production build, so I could not test them |
| JS output drills               | Node 22.11                                                                                                                                                                                                                                   | all 20 match                                                                                                                                                                                                            |
| In-chapter "Run this" blocks   | Extracted the 101 `.try` blocks in JS chapters, ran in a Node `vm`                                                                                                                                                                           | 91 run cleanly. 4 need a browser. 6 throw on purpose (TDZ or hoisting demos). 0 unintended failures                                                                                                                     |
| Interview structure            | Script over `INTERVIEW_ROUNDS_RAW`                                                                                                                                                                                                           | 245 questions, 245 model answers, 128 traps, 613 follow-up prompts, 40 "say it like this" scripts, 96 code blocks                                                                                                       |
| Competitor structure           | `WebFetch` on public pages (small-model summaries, so counts are approximate), plus a plain-fetch word count of 13 article pages                                                                                                             | Cited per claim below                                                                                                                                                                                                   |
| Live-site speed                | `curl` timing, 7 URLs, one run each                                                                                                                                                                                                          | Groundwork pages: TTFB 0.13 to 0.16 s, 31 to 49 KB. javascript.info 0.54 s. MDN 0.14 s. react.dev 0.17 s                                                                                                                |
| Repo checks                    | Ran `npx vitest run tests/claims.test.ts tests/content.test.ts tests/chapter-standards.test.ts`                                                                                                                                              | 65 tests passed                                                                                                                                                                                                         |

Rubric constraints I followed: no logins, no paywall bypass, a handful of normal page fetches, no competitor text quoted beyond a few words. GreatFrontEnd mostly sits behind a paywall, so I could only judge its public pages and marketing claims.

## Checklist coverage

Union of the competitors' public syllabi. Competitor columns: Y = covered, P = partial, N = absent or not applicable.

Sources:

- javascript.info: https://javascript.info/ (14 sections of Part 1, 6 of Part 2, 7 of Part 3; 175 visible articles)
- MDN Guide: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- react.dev: https://react.dev/llms.txt (Learn: 35 pages in 4 sections, plus 16 Get Started pages; Reference is large)
- GreatFrontEnd (GFE): https://www.greatfrontend.com/questions (356 coding questions listed, "500+" claimed on https://www.greatfrontend.com/pricing)
- FIH: https://www.frontendinterviewhandbook.com/

### JavaScript language and browser

| Topic                                                                          | Groundwork (OBSERVED, from chapter titles and headings) | javascript.info             | MDN | GFE                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------- | --------------------------- | --- | ---------------------- |
| Mental model, execution context, hoisting, TDZ                                 | Written (B1, B2, B3)                                    | Y                           | Y   | quiz                   |
| Scope, closures, `this`, prototypes, classes                                   | Written (B4, B12, B13, I1, I3)                          | Y                           | Y   | quiz and coding        |
| Types, coercion, numbers, strings, Math                                        | Written (B7, B8, B9)                                    | Y                           | Y   | quiz                   |
| Objects, arrays, Map/Set, WeakMap, descriptors                                 | Written (B11, I2, A3)                                   | Y                           | Y   | coding                 |
| Event loop, microtasks, Workers                                                | Written (B5, A2)                                        | Y                           | Y   | quiz                   |
| Promises, async/await, AbortController                                         | Written (B15, I4, A2)                                   | Y                           | Y   | coding                 |
| Generators, iterators, iterator helpers                                        | Written (A2, A3, I11)                                   | Y                           | Y   | P                      |
| Modules (ESM, CJS, import maps)                                                | Written (I5)                                            | Y                           | Y   | quiz                   |
| Error handling                                                                 | Written (B16, I7)                                       | Y                           | Y   | P                      |
| Proxy and Reflect, Symbol, metaprogramming                                     | Written (A3)                                            | P                           | Y   | N                      |
| BigInt, typed arrays, Blob and File, Unicode, Intl                             | Written (A4)                                            | Y                           | Y   | N                      |
| Dates and Temporal                                                             | Written (I6, I11); Temporal is covered                  | P                           | Y   | N                      |
| Regular expressions                                                            | Thin: about 900 prose words (I6)                        | Y (17 articles)             | Y   | P                      |
| Memory, GC, hidden classes, V8                                                 | Written (A1)                                            | N                           | P   | quiz                   |
| DOM, events, delegation                                                        | Written but short: 1,212 words for B14                  | Y (11 + 5 + 6 articles)     | N   | coding                 |
| Storage, IndexedDB, Service Workers                                            | Written (I9, I10)                                       | Y                           | N   | quiz                   |
| WebSocket, SSE, long polling                                                   | Written (I8)                                            | Y                           | N   | quiz                   |
| Fetch, URL, CORS, XHR, FormData                                                | Fetch, URL, CORS yes; XHR absent in `content/js`        | Y                           | N   | quiz                   |
| Web Components (custom elements, Shadow DOM)                                   | **Absent** (0 hits in `content/js`)                     | Y (7 articles)              | N   | P                      |
| ResizeObserver, drag-and-drop API, Selection/Range, frames and windows, canvas | **Absent or one mention**                               | Y (frames, selection, drag) | N   | P                      |
| Performance, security, testing, observability                                  | Written (A6, A7, A9, A10)                               | P                           | N   | quiz and system design |

### React

| Topic                                                                                             | Groundwork                                                 | react.dev                   | GFE / FIH                                                 |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------- | --------------------------------------------------------- |
| JSX, components, props, state, events, lists/keys, forms, effects (Describing UI, Interactivity)  | Written (B1 to B10)                                        | Y                           | quiz and UI coding                                        |
| Managing state: reducers, context, structure                                                      | Written (I2, I3, I7)                                       | Y                           | Y                                                         |
| Escape hatches: refs, effects, custom hooks, `useEffectEvent`                                     | Written (I1, I4, I5, A8, A10); `useEffectEvent` is covered | Y                           | quiz                                                      |
| Tutorial project                                                                                  | Task board (B11), not tic-tac-toe                          | tic-tac-toe                 | UI coding                                                 |
| Router, data fetching, server state, forms at scale, auth, i18n, uploads, real-time, testing, E2E | Written (I6 to I22)                                        | N (outside react.dev)       | P                                                         |
| Fiber, lanes, concurrent rendering, Suspense                                                      | Written (A1 to A3)                                         | P (concepts, not internals) | quiz                                                      |
| Server Components, Actions, `use()`, rendering strategies                                         | Written (A4 to A7)                                         | Y (reference)               | quiz                                                      |
| React Compiler                                                                                    | Covered in I8 and the effects chapters                     | Y                           | quiz                                                      |
| Accessibility, design systems, architecture, migration, debugging in production                   | Written (A13 to A20)                                       | P                           | system design (partial)                                   |
| Reference pages (every hook and API)                                                              | Not a goal                                                 | Y (about 130 pages)         | N                                                         |
| Vue, Angular, Svelte                                                                              | **Absent**                                                 | N                           | Y (UI coding offers React, Angular, Vue, Svelte, vanilla) |

### Interview

| Item                       | Groundwork (OBSERVED)                                                                                                                                                                                                                                                                                     | GFE                                                                                              | FIH                                                                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| JS "implement X" functions | About 35 to 40 exercises (debounce, throttle, memoize, curry, bind, deep clone and equal, the four Promise combinators, flat, emitter, LRU, pipe, compose, `new`, `instanceof`)                                                                                                                           | 205 listed (https://www.greatfrontend.com/questions/javascript)                                  | Links out to GFE                                                                                              |
| UI coding                  | 99 component-style React exercises, most of them small behaviours (hooks, state rules); I count about 35 that are app-widget sized (INFERRED from titles). No vanilla DOM variants. No data table, carousel, progress bar, toast, tic-tac-toe, wordle, file explorer or infinite scroll (searched titles) | 59 listed, 5 frameworks (https://www.greatfrontend.com/questions/user-interface)                 | Links out to GFE                                                                                              |
| Quiz and concept Q&A       | JS bank 34 + React bank 46 + 40 output drills + book rounds 69 frontend questions. No scored quiz                                                                                                                                                                                                         | 283 total claimed in the header, 159 quiz visible (https://www.greatfrontend.com/questions/quiz) | JS quiz page lists about 54, answers on page (https://www.frontendinterviewhandbook.com/javascript-questions) |
| Frontend system design     | **Absent** (the `system-design` track is backend). `architecture` chapters describe this site                                                                                                                                                                                                             | 20 listed, 2 free (https://www.greatfrontend.com/questions/system-design)                        | 20 designs, RADIO outline (https://www.frontendinterviewhandbook.com/front-end-system-design)                 |
| Machine-coding rounds      | 7 questions in R2, with state-shape guidance                                                                                                                                                                                                                                                              | covered by UI coding                                                                             | P                                                                                                             |
| HTML and CSS               | Stubs, unwritten. R4·FE has 7 questions                                                                                                                                                                                                                                                                   | quiz (HTML 5, CSS 7 visible)                                                                     | Y                                                                                                             |

## Head-to-head samples

Eight topics. Competitor facts come from the cited page. Word counts are my own count of the article text via plain fetch; MDN pages have no `<article>` tag in the HTML, so their counts include page chrome and are upper bounds.

### 1. Closures (foundational)

Groundwork: `content/js/closures.ts`. Competitors: https://javascript.info/closure and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures.

| Dimension                  | Groundwork (OBSERVED)                                                                                                                                                               | Competitors                                                                                                                                                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Correctness                | No factual error in the teaching. One overclaim: "almost every JavaScript memory leak is a closure." Also "the environment lives on the heap" is stated without noting V8 optimises | javascript.info: the function-in-`if` task answer is only right in strict mode, because of Annex B sloppy-mode hoisting. Reading an undeclared variable throws in both modes, but the article ties it to strict mode (both per the fetch summary) |
| Depth                      | 1,513 prose words. Live link vs snapshot, one call one closure, 5 jobs (factory, privacy, memoize, once, debounce/throttle), loop trap, memory, DevTools Scope panel                | javascript.info: about 2,080 words, 10 tasks with solutions, about 13 diagrams. MDN: 7 sections, about 29 code blocks, no diagrams, no exercises                                                                                                  |
| Diagrams and interactivity | A 3D scene, two step-through players, a dry-run table, a `var` vs `let` binding visualiser                                                                                          | javascript.info: about 15 runnable examples, SVG chain diagrams. MDN: static code only                                                                                                                                                            |
| Practice                   | 2 exercises (a counter and a loop fix), plus 5 "Before you move on" prompts                                                                                                         | javascript.info: 10 tasks inline                                                                                                                                                                                                                  |
| Interview framing          | "Say it like this", a one-sentence answer, traps list                                                                                                                               | None on either                                                                                                                                                                                                                                    |
| Freshness                  | Mentions `#private` fields, AbortController                                                                                                                                         | javascript.info closure page shows a June 2022 date. MDN modified 4 Nov 2025                                                                                                                                                                      |

Verdict: ahead on interactivity, framing and freshness. Behind javascript.info on exercise volume (2 vs 10) and diagram count.

### 2. Event loop and the single thread (foundational to intermediate)

Groundwork: `single-thread.ts`, then `async-properly.ts`, `advanced-async.ts`. Competitors: https://javascript.info/event-loop and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop.

- Groundwork (OBSERVED): about 1,840 prose words. It covers why one thread, blocking, the host-API relay, two queues, a dry-run table, timer minimum delay, microtask starvation (with the setTimeout contrast), and Workers. Two animated players.
- javascript.info (via fetch summary): about 1,600 words, 2 diagrams, 1 task, three use-cases, and a Workers mention. It says the browser and Node run the same loop, which is a simplification.
- MDN (via fetch summary): a reference-style page on the execution model, not a tutorial. No `setTimeout(fn, 0)` explanation. A loose statement that memory is shared via `postMessage()`.
- Gap: Groundwork's interview round R3 Q1 says the Node nextTick/microtask queues drain "between EVERY phase transition". Since Node 11 they drain after each individual callback. INFERRED from Node's documented behaviour; I did not re-run it. Its listing "1 6 4 3 5 2" is right for CommonJS (I did not isolate it). In ES modules `nextTick` fires after the promise jobs, and the book does not say so.
- Verdict: ahead on teaching clarity and interactivity. On par on correctness.

### 3. `this` (intermediate)

Groundwork: `this-keyword.ts`. Competitor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this.

- Groundwork: 1,118 prose words. Ranked four-rule model, six-call-site dry run, arrows, lost-`this` and 3 fixes, class, DOM handler. Strong teaching order. Correct.
- MDN: a thorough reference (about 30 snippets). Covers `with`, getters and JSON replacers. No exercises. Modified 22 May 2026.
- Internal inconsistency in Groundwork: the chapter teaches four rules plus arrow opt-out. Interview R3 Q10 says "exactly five rules".
- Verdict: ahead for teaching, behind for completeness.

### 4. Async and promises (intermediate)

Groundwork: `async-properly.ts` (2,500 words incl. recipes), R3 Q2 to Q7, and 9 exercises including `Promise.all`, `allSettled`, `any`, `race`, `try`. Competitor: https://javascript.info/async-await (about 975 words, 4 tasks with solutions, thenables, top-level await, no diagrams).

- Groundwork (OBSERVED): covers accidental sequential awaits, `forEach` not awaiting, `Promise.all` not cancelling, unhandled rejections, AbortController, stale-response races. These are failure modes javascript.info's async-await article does not cover. The build-it exercises are test-checked. All pass.
- Verdict: ahead on practical depth and practice.

### 5. `useState` (React foundational)

Groundwork: `react-usestate.ts` (904 prose words, 5 exercises). Competitors: https://react.dev/learn/state-a-components-memory (about 1,600 words) and https://react.dev/learn/state-as-a-snapshot (about 1,300 words, 7 sandboxes, 6 illustrations, 7-bullet recap, 1 challenge).

- Groundwork: correct on snapshot, batching since 18, call-order slots, immutability table, nested state, bail-out, lazy init, "what should be state" table. Compact and accurate.
- react.dev: far more worked, visual and runnable. One page is built around hands-on sandboxes. Groundwork's chapter has no live example in the prose and no diagram.
- Verdict: behind react.dev on pedagogy and interactivity. On par on accuracy. Groundwork's table-driven density suits revision more than first learning.

### 6. Effects (React intermediate)

Groundwork: `react-effects-depth.ts` (1,242 words) plus `react-useeffect-basics.ts` and `react-effect-timing.ts`. Competitors: https://react.dev/learn/you-might-not-need-an-effect (about 4,100 words, 12 subsections, 4 challenges, 9 sandboxes, does NOT cover `useEffectEvent`) and https://react.dev/reference/react/useEffect (17 sandboxes, 5 troubleshooting items).

- Groundwork (OBSERVED): covers `useEffectEvent` as stable in React 19.2, which I recognise as correct from my own knowledge of the release. Four stale-closure fixes ranked, a dependency-removal taxonomy, set-state-during-render, AbortController race, Strict Mode. One example uses an undeclared `increment` variable.
- react.dev: more complete on the "do you need an effect" cases, and it has real sandboxes.
- Verdict: on par on technical content, behind on interactivity and on total depth.

### 7. Server Components and the security surface (React advanced)

Groundwork: `react-server-components.ts` (1,330 words). Competitor: https://react.dev/reference/rsc/server-components (about 950 prose words, 16 code blocks, no diagrams, no exercises, bundler-dependent notes).

- Groundwork has what react.dev's page lacks: SSR vs RSC comparison, serialisation rules, wire-format sample, `cache()` dedupe, per-segment errors, and a React2Shell section. I checked the CVE-2026-23864 line and the patched versions 19.0.4, 19.1.5, 19.2.4 against Akamai and NVD results; they match. React2Shell (CVE-2025-55182, disclosed 3 December 2025) matches my own knowledge of the incident.
- Unverified: the claim that React 19.3 lets a server component render a context provider directly. Only third-party blogs support it (one LogRocket post and one DEV post, per search); I found no official release note.
- No links to any advisory.
- Verdict: ahead on breadth and freshness for a learner. Behind on citation.

### 8. Fiber and reconciliation internals (React advanced)

Groundwork: `react-fiber.ts` (1,253 words, double buffering, lanes, bailouts, an exercise that reconciles children by hand). react.dev's Learn and Reference listings (https://react.dev/llms.txt) contain no page on Fiber internals. INFERRED: react.dev does not teach this, so Groundwork has no competitor to match here. GFE's quiz has a "What is React Fiber" question.

- Verdict: "not comparable". It is a differentiator.

### 9. Interview Q&A: R3 (JS) and R4 (React) vs GFE and FIH

Groundwork: `content/interview-data.ts` rounds R3 (22 questions), R3·TS (9), R4 (16), R4·FE (7), R2 (7).

- Model answers are mostly 30 to 130 words in R3 and R4 (R4·FE up to about 215), with 96 code blocks across the book and a named trap on about half the questions (128/245).
- Correct on everything I checked: event loop, `await`, `Promise.all`, pool, backoff with jitter, `bind`, TDZ, `structuredClone`, `==`/`===`, Map/Set, ESM live bindings, tree shaking, keys, caching (Next 15 default flip), hydration.
- Defects found (OBSERVED unless noted):
  - `revalidateTag('bookings')` in the Server Action example uses the one-argument form, which Next 16 deprecates in favour of `revalidateTag(tag, profile)` or `updateTag`, per the Next.js beta announcement and docs messages (https://nextjs.org/docs/messages/revalidate-tag-single-arg). The round's intro says answers are "checked against what ships in September 2026".
  - The Node phase statement (see sample 2).
  - "Exactly five rules" for `this` (see sample 3).
- The book is written around one persona. Examples include "six years", "the clinic search on the booking platform", "your Redux to Zustand migration", and first-person model answers. A reader with a different CV gets answers that assume experience they do not have.
- Follow-ups: 613 are listed as prompts only. 0 have written answers.
- FIH: its JS quiz page has about 54 questions with answers on the page and references; everything else links to GFE. GFE: model solutions for coding questions run to explanation, pitfalls and multiple implementations (debounce: https://www.greatfrontend.com/questions/javascript/debounce; promise-all: https://www.greatfrontend.com/questions/javascript/promise-all). Groundwork's exercises have a solution but no explanation field.
- Verdict: on par with FIH on concept Q&A quality. Behind GFE on volume, solution write-ups and breadth. Ahead of both on "traps" and current-version framing.

## Scorecard

1 = weak or missing, 3 = adequate, 5 = best in class. The evidence column cites a file or URL. GFE is scored on public pages only, so its scores are lower-confidence (INFERRED where I could not see behind the paywall).

| Dimension         | Groundwork | javascript.info | MDN | react.dev        | GFE              | Evidence                                                                                                                                                                                                                                                   |
| ----------------- | ---------- | --------------- | --- | ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Coverage          | 3.5        | 4.5             | 5   | 4.5 (React only) | 4.5              | GW: no Web Components, no XHR, no frames, thin regex, HTML/CSS stubs, no other frameworks. jsinfo 175 articles. MDN guide has 19 chapters plus intermediate and advanced. react.dev 51 Learn pages plus a large Reference. GFE 356 coding questions listed |
| Depth             | 3.5        | 4               | 4.5 | 4.5              | 4                | GW JS mean 1,475 words, React 862 (OBSERVED) vs jsinfo closure 2,080, react.dev useEffect reference 4,050, you-might-not-need 4,130. GW advanced React chapters have no free competitor                                                                    |
| Accuracy          | 4.5        | 4               | 4.5 | 5                | 4 (unverified)   | GW: 261/261 solutions pass, 38/38 runnable drills match. 1 rendering bug, 2 inconsistencies, 1 deprecated API call. jsinfo: sloppy-mode answer wrong (fetch summary). MDN: a loose `postMessage` claim (fetch summary)                                     |
| Freshness         | 4.5        | 3               | 5   | 5                | 4                | GW chapters dated Sept 2026, content current to React 19.2, Next 16, ES2026. jsinfo example dated 2022. MDN pages modified Nov 2025 to May 2026                                                                                                            |
| Practice material | 3.5        | 3               | 1.5 | 4                | 5                | GW 261 exercises, 2,098 tests, 0 quizzes, 2.2 hints mean, no explanations. jsinfo has tasks with solutions (10 in closure). MDN none. react.dev challenges inline. GFE 205 JS + 59 UI + quiz                                                               |
| Interactivity     | 3.5        | 3               | 2   | 5                | 4.5              | GW JS: 101 Run-this blocks, 3D scene, step players. GW React teaching chapters: 0 runnable blocks, 2 SVGs in 57 chapters. react.dev 7 sandboxes on one page, 17 on another                                                                                 |
| Learning design   | 4          | 4               | 3   | 5                | 4.5              | GW: levels, prerequisites, guided projects, dry runs, traps, one-line answers. No scored self-check. react.dev: ordered, recaps, challenges. GFE: study plans (pricing page, marketing)                                                                    |
| Trust             | 2.5        | 3.5             | 5   | 5                | 4                | GW: single named author (meta.author "Akshat"), 0 React and 3 JS external links, no reviewers. jsinfo: named maintainer, open source. GFE: authors claimed ex-FAANG on its own marketing page, not verifiable                                              |
| Scale of data     | 3          | 4               | 5   | 4.5              | 5                | GW: 98 chapters, 261 exercises, 245 interview questions, about 170 frontend Q&A. GFE "500+"                                                                                                                                                                |
| Polish and speed  | 4          | 3.5             | 4   | 5                | 4.5 (unmeasured) | GW TTFB 0.13 to 0.16 s, 31 to 49 KB (7 curls). jsinfo 0.54 s. react.dev 0.17 s. MDN 0.14 s                                                                                                                                                                 |

## Verdict per dimension

| Dimension         | Verdict                                                          | Reason                                                                                                                                                                              |
| ----------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Coverage          | Behind                                                           | Core JS and React are well covered, but the web platform breadth, HTML/CSS, other frameworks and frontend system design are not there                                               |
| Depth             | On par for JS, behind for React basics, ahead for React advanced | JS chapters are about as long as javascript.info pages; React basics are about half the length of react.dev's with no sandboxes; Fiber, lanes and RSC wire format have no free peer |
| Accuracy          | On par                                                           | Strong on everything I ran; I found a handful of small defects, not the systematic kind. Competitors have defects too, but MDN and react.dev have scale of review                   |
| Freshness         | Ahead of javascript.info, on par with MDN and react.dev          | Content tracks 2026 releases and is date-stamped                                                                                                                                    |
| Practice material | Ahead of the free references, behind GFE                         | 261 test-checked exercises beats almost nothing, but GFE has more question types, solutions and a quiz bank                                                                         |
| Interactivity     | Mixed: ahead on JS, behind on React                              | JS has runnable blocks and visualisers; React teaching pages are static                                                                                                             |
| Learning design   | On par                                                           | Good structure and order; no scored self-check and no hints beyond 2.2 per exercise on average                                                                                      |
| Trust             | Behind                                                           | One author, no citations, no reviewers, "most-asked" claims without a source                                                                                                        |
| Scale of data     | Behind                                                           | Under half GFE's claimed question count, and under javascript.info on topic count                                                                                                   |
| Polish and speed  | On par                                                           | Fast pages, comparable load                                                                                                                                                         |

## Where Groundwork is ahead

1. **Verified practice.** 261 of 261 reference solutions pass 2,098 tests, and no starter passes. javascript.info and MDN do not publish tests with their tasks. INFERRED for the "do not": I saw tasks with solutions on javascript.info, not tests, and none on MDN.
2. **Freshness and honesty about versions.** The Modern JS chapter separates "spec year" from "Baseline support date"; the Temporal, `useEffectEvent`, React Compiler and Next 15/16 caching content is current. javascript.info's closure page carries a 2022 date.
3. **Failure-mode teaching.** Accidental sequential awaits, stale responses, microtask starvation, lost `this`, `useEffect` taxonomy, "adjust state during render". These are what interviews ask and what tutorials skip.
4. **Advanced React internals and RSC security** in one place (Fiber lanes, RSC payload shape, React2Shell with patched versions). I found no equivalent on react.dev.
5. **Interview framing.** Every concept chapter has a traps list, a "say it like this" line and a one-sentence answer. Neither MDN nor javascript.info has this.
6. **Speed.** Server-rendered pages load as quickly as MDN and react.dev.

## Where it is behind

1. **React teaching pages are static and thin.** 862 average prose words, 0 live sandboxes, 2 diagrams in 57 chapters. react.dev has a sandbox on nearly every concept. The sandbox runtime already exists in `lib/reactSandbox/runtime.ts` (used for exercises), so this is a wiring gap.
2. **No self-check at all for JS or React.** `lib/quizPool.ts` lists only DSA pools. The site's own standard requires a 5-question self-check with a pass mark. GFE offers a bank of 283 questions.
3. **The content standard has never been applied to JS or React.** The standard asks for 3,500 to 5,000 prose words. Only the upper limit is enforced (`tests/chapter-standards.test.ts`). The audits are DSA and system-design only.
4. **No frontend system design, thin UI-coding set, no vanilla or other framework variants.** GFE and FIH both centre these.
5. **Interview follow-ups unanswered.** 613 prompts, 0 answers. Interview answers are short (mostly 30 to 130 words) next to GFE's multi-section solutions.
6. **Citations.** 3 external links in 98 chapters (one is `api.example.com`), 0 in the interview book. Specific claims (CVE IDs, Temporal stage 4, React 19.3 context provider, Next 16 behaviour) have no link a reader could follow.
7. **Platform gaps in JS:** Web Components, Observers (Resize, Mutation), Drag and Drop API, Selection/Range, XHR, frames and windows, canvas, regex depth.
8. **Exercise quality gaps:** 34 of 162 React exercises have fewer than 6 tests (the standard says 6 or more). 49 of 261 exercises have a single hint, and no JS exercise has a solution explanation.
9. **No CI for exercise solutions.** `tests/content.test.ts` only checks that every exercise has at least one test. Nothing runs the JS or React solutions. My run is the only evidence they pass; a future edit could break one silently.

Defects I found, each fixable in minutes:

- `content/react/react-review-judgement.ts` line 80: the source has `\/` inside a template literal, which drops the backslash. The rendered snippet reads `/^(https?:|mailto:|/)/i` and is a syntax error on the page. Only instance of a lost backslash in `content/js`, `content/react` and `interview-data.ts` (grep).
- `react-effects-depth`: the `useEffectEvent` example uses an undeclared `increment`.
- `closures`: "almost every JavaScript memory leak is a closure" is an overclaim against the site's own "no always/never/only without proof" rule.
- R3 Q10 says five `this` rules, the `this-keyword` chapter says four plus arrows.
- R3 Q1 phase wording for Node (see sample 2).
- R4 Q11 `revalidateTag` single-argument form (see sample 9).

## Gap list

Effort is agent-assisted days. Token class: small under 0.5M, medium 0.5M to 3M, large over 3M.

| #   | What                                                                                                                                                                                                         | Why it matters                                                                                     | Effort                         | Tokens          | Priority        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------ | --------------- | --------------- |
| 1   | Fix the six defects listed above                                                                                                                                                                             | They are visible errors on a page that claims "checked against what ships"                         | 0.5 day                        | small           | P0              |
| 2   | Sources layer: a "Sources" footer per chapter (MDN, spec, react.dev, advisories) and a "last verified" date; run `scripts/check-sources.mjs` over `content/js`, `content/react`, `content/interview-data.ts` | Trust is the lowest-scoring dimension; the checker already exists for system design                | 2 days                         | medium          | P0              |
| 3   | Add a CI test that runs every JS solution in Node and every React solution in the Chromium harness (my scripts are in the scratchpad)                                                                        | Protects the strongest asset; currently nothing guards it                                          | 1 day                          | small           | P0              |
| 4   | Self-check quiz pools for 98 JS and React chapters, 8 to 10 questions each, with a pass mark                                                                                                                 | Required by your own standard; GFE has 283 quiz questions; today JS and React have none            | 4 to 5 days                    | large           | P0              |
| 5   | Written answers for the 613 interview follow-ups (3 to 5 lines each)                                                                                                                                         | Required by your own standard; this is the part of the book that simulates a real interviewer      | 3 to 4 days                    | medium          | P1              |
| 6   | Live React sandboxes inside React chapters (about 150 snippets), reusing `lib/reactSandbox/runtime.ts` and the existing `.try` pattern                                                                       | Largest interactivity gap against react.dev; the runtime exists                                    | 3 days                         | medium          | P1              |
| 7   | Frontend system design track: 15 to 20 designs (autocomplete, news feed, chat, carousel, data table, modal and so on) in a RADIO-style structure                                                             | Both FIH and GFE have 20; Groundwork has none; it is a standard senior frontend round              | 5 to 7 days                    | large           | P1              |
| 8   | UI-coding expansion: 30 more machine-coding tasks (data table, carousel, progress bar, toast, wordle, file explorer, infinite scroll) plus vanilla DOM variants                                              | GFE lists 59; Groundwork has about 35 widget-sized ones, all React                                 | 4 to 5 days                    | large           | P1              |
| 9   | Solution write-ups for all 261 exercises (approach, complexity, pitfalls), 3 hints each, and at least 6 tests on the 34 short React ones                                                                     | GFE's value is in the solution text; yours is code only                                            | 3 days                         | medium          | P1              |
| 10  | Apply the content standard to React chapters: add dry-run tables, 1 to 2 diagrams each for render/commit, snapshot, keys, effects                                                                            | Average 862 words and 2 diagrams in 57 chapters; react.dev is the comparison                       | 6 to 8 days                    | large           | P1              |
| 11  | Audit JS and React the way DSA and system design were audited; publish `docs/content-audit/js.md` and `react.md`                                                                                             | Without it the 6.8/10 average in your standard cannot be tracked for these topics                  | 1 day                          | small to medium | P1              |
| 12  | JS platform gaps: Web Components, Observers, Drag and Drop, Selection/Range, XHR, frames, canvas intro, regex depth                                                                                          | javascript.info covers all of these; learners hit them                                             | 4 to 5 days                    | medium          | P2              |
| 13  | Make the interview book persona-neutral: a "swap in your own resume" mode, or generic examples next to the persona ones                                                                                      | Model answers speak as one specific candidate; a reader with another CV cannot reuse them honestly | 2 days                         | medium          | P2              |
| 14  | HTML and CSS chapters written                                                                                                                                                                                | Frontend interviews test them; R4·FE has only 7 questions on them                                  | large; other agent's area      | large           | P1 (cross-area) |
| 15  | Vue, Angular, Svelte tracks                                                                                                                                                                                  | GFE offers them                                                                                    | not recommended for one author | large           | P2              |

## Hard truths

1. **Headline numbers overstate frontend content.** The `architecture` topic (26 chapters, 41,219 words) is about Groundwork itself. It is a good document but it is not a frontend course and no competitor has one. It also counts towards the "chapters written" total. In the interview book, the "27 rounds" include a resume-attack round built on a sample profile, behavioural, HR, offer and levels rounds. Frontend-specific questions are about 69 in the book.
2. **JS and React chapters are well below your own standard.** Mean prose words: JS 1,475, React 862, against a stated 3,500 to 5,000. The standard's lower bound is not tested. The 6.8/10 average in the standard was measured before these topics were brought up to it, and I found no audit for them afterwards.
3. **No quizzes.** Practice for JS and React is exercises only. A learner has no scored way to find out whether they understood a chapter.
4. **Single author, no review, almost no citations.** `meta.author` is "Akshat" on every topic. There is no reviewer, no "last verified" per claim, and no link behind specific claims such as CVE numbers. A reader cannot tell the strong claims from the weak ones, and I could only confirm the React 19.3 claim through secondary posts.
5. **Frequency claims have no source.** Fields such as "the single most-asked senior JavaScript question" and "asked constantly at senior level" have no data behind them. There is no real candidate data, no outcome data, no community.
6. **Interview answers are written in one person's voice.** Several "say" scripts claim experience ("the clinic search on the booking platform", "we lost time-travel debugging"). The book frames them as examples, but a candidate who copies them is claiming work they did not do. That is a risk to the user, not just a quality issue.
7. **Practice is strong but narrow.** 261 test-checked exercises is real, but the tests are written by the same author with the same harness, and no mutation or independent-reference check exists. I confirmed starters fail and solutions pass; I did not test whether wrong-but-plausible solutions fail.
8. **Scale gap.** GFE lists 356 coding questions plus 283 quiz questions and 20 system designs, with solutions by named reviewers, and has years of community use. Groundwork has about 170 frontend Q&A and 261 exercises. Closing the volume gap is weeks of work, and the trust gap is not closable by content alone.
9. **CI guards claims but not correctness of exercises.** `tests/claims.test.ts` keeps counts honest, which is good. It does not keep solutions passing.
10. **Site claims I could not back from the repo:** "The whole map, 41 sections deep" for JavaScript is a count, not coverage; Web Components, canvas, XHR and frames are absent. I did not review the home page text beyond what `tests/claims.test.ts` already pins.

## What I could not verify

- GreatFrontEnd's solution quality, test-case depth, premium content and totals. Public listing pages were truncated by the fetch tool; counts (205 JS functions, 59 UI, 20 system design, 283 or 159 quiz, "500+") come from page text read by a small summarising model and its own marketing page, so treat them as approximate and as claims.
- Fetch summaries for javascript.info, MDN and react.dev structure (headings, number of sandboxes, tasks) were produced by a summarising model. I double-checked only the word counts, with my own plain fetch. MDN word counts include page chrome and are upper bounds.
- Whether MDN or react.dev have errors I did not see. I took inaccuracy notes from the fetch summaries as reported, not as independently confirmed (the Annex B point on javascript.info, the `postMessage` wording on MDN).
- React 19.3 server-component context provider behaviour (only third-party posts), Safari's Temporal status (search returned nothing), Temporal stage 4 date (secondary posts).
- Strict Mode drills 5 and 16: dev-only behaviour, my harness uses the production build.
- Live-site behaviour beyond 7 timed HTTP fetches. I did not open the live site in a browser, so I did not check that the 3D closure scene and the step players render correctly there.
- Whether Groundwork's 804,000-word total is correct. I measured only my four areas.
- The rest of the 235 chapters and the other topics, which belong to other agents.
- I read about 20 chapters closely (closures, single-thread, this, usestate, effects-depth, server-components, modern-js, interview-bank, react-interview-bank sections, R2/R3/R4 in full) and skimmed the rest through headings. Defects in the unread chapters are likely and unmeasured.

Scripts and dumps are in the scratchpad: `runjs3.ts`, `runreact.ts`, `drillsrun.ts`, `m2.ts` (counts), `iv.txt` (interview text).
