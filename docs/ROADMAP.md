# Roadmap

What is left to build, in the order it is worth building, and why. Site figures were measured against
the build; market figures are cited, with the weaker ones marked. Last measured 15 September 2026.

The site is production-ready as it stands: 602 prerendered pages on a CDN, security headers, and CI
that typechecks, lints, spell-checks, runs unit tests, a Playwright smoke and accessibility suite,
and Lighthouse budgets. Nothing below is broken. It is what the site needs in order to grow.

A visual version of this file, with progress bars, is [`roadmap.html`](roadmap.html).

---

## 0. Content — the half the engineering serves

Measured today: **7 of 21 topics are written** — 194 chapters written, 358 still outlines, plus
Git's 16 standalone sections.

| Topic             | Written   | Exercises | Words | Cheat page |
| ----------------- | --------- | --------- | ----- | ---------- |
| JavaScript        | 41        | 99        | 54k   | yes        |
| React             | 57        | 135       | 42k   | yes        |
| DSA in JS         | 34        | 277       | 48k   | **no**     |
| System Design     | 24        | **0**     | 61k   | **no**     |
| Interview book    | 27 rounds | **0**     | 61k   | —          |
| How this is built | 18        | —         | 7k    | —          |
| Git               | 16        | **0**     | —     | yes        |
| The other 14      | outline   | —         | —     | —          |

**One correction.** The last version of this file said the interview book held 405 questions.
Counted one question object at a time, it holds **230** across 27 rounds.

The fourteen outlines — Node 41, TypeScript 29, Next.js 29, Nest.js 26, CSS 25, SQL & Databases 25,
Testing 24, Web Security 24, Cloud & DevOps 24, Kubernetes 24, HTML 22, Docker 22, GraphQL 22,
Redis 21 — were planned before anyone checked which of them readers are actually hired for. Section
0.1 checks; section 0.2 turns the answer into an order.

There is still no engineering blocker on any of it. Adding a chapter means adding a file under
`content/<topic>/`; routes, search index, sitemap, reading time and progress all follow from there.

### 0.1 What the job market is asking for — September 2026

Twelve findings. Primary sources (GitHub, Stack Overflow, State of JS, Naukri, framework release
notes) carry the weight. Figures from vendor blogs and job-board write-ups are marked
**directional** — reliable for which way things are moving, not for the exact number.

**1. TypeScript is the default, not the upgrade.** TypeScript became the most-used language on GitHub
by monthly contributors in August 2025, passing Python and JavaScript — 2.6 million contributors, up
66% in a year ([Octoverse 2025][octoverse]). Frontend hiring guides report candidates without
TypeScript being screened out earlier than a year ago.
_For Groundwork:_ the largest gap on the shelf. Every written JavaScript, React and Node-adjacent
chapter assumes TypeScript; the topic behind that assumption is an outline.

**2. React is settled; Next.js is where the questions are.** React is used by 83.6% of State of JS
2025 respondents ([State of JS][stateofjs]). Next.js is used by 59% of them, leads meta-frameworks,
and is losing satisfaction at the same time ([InfoQ][infoq]). Next.js 16 made caching opt-in with
`use cache` and Cache Components ([Next.js 16][next16]). React Compiler 1.0 shipped in October 2025
and is on by default in new Next.js and Vite apps. Server Component security advisories landed in
December 2025.
_For Groundwork:_ Next.js is P0 and must be written against 16 — anything about App Router caching
written before it is now wrong by default. React needs three new sections: the Compiler, the RSC
security advisories, and Actions in depth.

**3. Node and Postgres are the backend half of nearly every job description.** Node.js is the most-used
web technology in the 2025 Stack Overflow survey at 49.1%, ahead of React. PostgreSQL has been the
most admired and most wanted database three years running ([Stack Overflow 2025][so-tech]). Redis
shows up wherever caching, rate limits or queues do; Prisma and Drizzle are the two ORM names in
2026 writing ([directional][drizzle]).
_For Groundwork:_ Node.js is P0. SQL & Databases is P1, written Postgres-first with a real ORM and
migrations rather than as a survey of every database. Redis shrinks to what a product engineer uses.

**4. AI engineering is now a web-developer skill.** Naukri recorded AI/ML hiring in India up 33% year
on year in July 2026 while overall IT hiring stayed modest ([JobSpeak July][naukri-jul]). 84% of
developers use or plan to use AI tools, 51% of professionals daily ([Stack Overflow 2025][so-ai]).
Every major agent framework now ships a first-class TypeScript path — the Vercel AI SDK, Mastra (1.0
in January 2026), LangGraph.js — and MCP has become the interoperability standard
([directional][arcade]).
_For Groundwork:_ the one important topic not on the shelf at all, and the fastest-growing line in
the Indian data. A new topic, **AI engineering for JavaScript developers**, is P0.

**5. Interviews now include an AI round, and a code-reading one.** Meta replaced one of its two onsite
coding rounds with an AI-enabled one from October 2025: sixty minutes in a multi-file codebase — fix a
bug, implement, optimise — with a model in a side panel ([Hello Interview][meta]). Google is piloting
a code-comprehension round with Gemini available and grades "AI fluency": prompting, validating
output, debugging it ([Exponent][google]).
_For Groundwork:_ the interview book has no round for either. Add them, and add a practice format built
on reading and fixing an existing project rather than writing from a blank file.

**6. DSA still gates FAANG, but it is not the whole loop.** A review of 74 recent loops found at least
two dedicated coding rounds at every FAANG company, while Stripe, OpenAI and Anthropic leaned towards
multi-part implementation and debugging ([LeetCode discuss][leetcode]). India's product companies
keep the machine-coding round — Flipkart's frontend version is a two-hour build in plain HTML, CSS and
JavaScript ([Flipkart SDE2][flipkart]).
_For Groundwork:_ the 277 DSA exercises stay worth it. Missing is practice for the other formats — a
machine-coding exercise type and multi-part implementation problems.

**7. Frontend system design is its own round now.** Guides describe the 2026 frontend loop the same way:
recruiter screen, technical screen, coding, a frontend system design round, behavioural
([Front End Interview Handbook][fe-handbook]). The prompts repeat — feed with infinite scroll,
autocomplete, chat, collaborative editor, email client. AI-product design prompts — a chatbot, a RAG
document assistant, a coding agent — are standard for AI-adjacent roles ([GenAI guide][genai-sd]).
_For Groundwork:_ System Design is 61k words of backend design with no frontend track, no GenAI track,
no cheat page and no exercises. Add both tracks, about eight frontend and four GenAI walkthroughs,
with a prompt-and-rubric exercise format.

**8. Docker is expected; Kubernetes mostly is not.** Docker usage jumped 17 points to 71% in the 2025
Stack Overflow survey, the largest move of any tool ([press release][so-press]). Writing on
JavaScript roles puts Docker and CI/CD among required skills at the senior band and treats Kubernetes
as needed only where the job names it ([directional][docker-js]).
_For Groundwork:_ Docker with CI/CD (GitHub Actions) is P1. Kubernetes drops to P3 and shrinks from 24
planned chapters to about eight.

**9. Playwright won end-to-end testing.** Playwright is described as the default for new projects in
2026, with roughly half of surveyed QA professionals on it against Cypress at around 14%
([directional][bugbug]).
_For Groundwork:_ Testing is P1, Playwright-first for end-to-end and Vitest for units. This repository
runs both in CI, which makes it the worked example.

**10. OWASP rewrote its Top 10, and accessibility became law.** The OWASP Top 10:2025 adds Software
Supply Chain Failures and Mishandling of Exceptional Conditions, moves Security Misconfiguration to
second, and folds SSRF into Broken Access Control ([GitLab][owasp]). The European Accessibility Act
has been enforceable since 28 June 2025 against WCAG 2.1 AA ([Chromatic][eaa]), and senior frontend
interviews ask for an accessible combobox.
_For Groundwork:_ Web Security should be structured on the 2025 list. HTML is worth writing mainly for
its accessibility half, and accessibility should be a required section in every frontend system
design walkthrough.

**11. GraphQL plateaued.** GraphQL is reported settled at around a quarter of enterprise applications
after its 2021–22 peak, with REST near-universal and tRPC appearing in TypeScript-and-Next.js
listings ([directional][api-layers]).
_For Groundwork:_ do not write 22 GraphQL chapters. Fold it into one API-design unit inside Node —
REST, GraphQL, tRPC, and when each wins — of about six chapters.

**12. Juniors are hired on judgement, not boilerplate.** US write-ups put entry-level hiring down about
two-thirds since 2022 ([directional][dice]). India's data points the other way: Naukri recorded
fresher (0–3 years) hiring up 15–17% year on year through 2026 ([JobSpeak June][naukri-jun]). Both
agree on what gets screened for — reading unfamiliar code, reviewing AI output, debugging.
_For Groundwork:_ the audience this site is written for is in the better half of that split. The
practice should match the screen: debugging and code-review exercises, not only write-from-scratch.

### 0.2 What to write next

Priority is market signal against what already exists here. "Planned" is the current outline;
"proposed" is where the research says the outline is the wrong size.

| P   | Topic                            | Size               | Why                                                                      |
| --- | -------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| P0  | TypeScript                       | 29 planned         | #1 on GitHub; screened for early; assumed by every written topic         |
| P0  | Next.js                          | 29 planned         | The meta-framework JDs name; write against 16                            |
| P0  | Node.js                          | 41 planned         | Most-used web technology; absorbs the API-design unit                    |
| P0  | AI engineering for JS devs (new) | ~16 proposed       | LLM calls, streaming UI, tools, structured output, RAG, evals, MCP, cost |
| P1  | SQL & Databases                  | 25 planned         | Postgres-first, with an ORM and migrations                               |
| P1  | Testing                          | 24 planned         | Playwright and Vitest, this repo's CI as the example                     |
| P1  | Docker + CI/CD                   | 22 + part of 24    | Merge with the CI half of Cloud & DevOps                                 |
| P1  | System Design: frontend + GenAI  | ~12 proposed       | Two missing tracks inside a written topic                                |
| P1  | Interview book: new rounds       | 3 rounds           | AI-assisted coding, code comprehension, frontend system design           |
| P2  | Nest.js                          | 26 planned         | Strong in Indian listings; after Node                                    |
| P2  | Web Security                     | 24 planned         | Restructure on OWASP Top 10:2025                                         |
| P2  | HTML & accessibility             | 22 planned         | Accessibility-led since the EAA                                          |
| P2  | CSS                              | 25 planned         | Layout, container queries, Tailwind as used                              |
| P2  | Redis                            | 21 → ~12           | Caching, rate limits, queues, sessions                                   |
| P3  | Kubernetes                       | 24 → ~8            | Read a manifest, work with a platform team                               |
| P3  | GraphQL                          | 22 → ~6, into Node | Folded into the API-design unit                                          |

P0 comes to about 115 chapters. At the length the JavaScript track settled on — around 1,350 words a
chapter — that is roughly the size of everything written on the site today. It is a quarter of work,
not a sprint, which is the reason to write the chapter template (section 0.4) before starting.

### 0.3 The gaps inside what is already written

**JavaScript is closed.** It has been audited three times and every verified finding fixed each time:
41 chapters, 99 exercises, a Build-it-yourself chapter, a Strings, numbers & Math chapter, and 20
output-prediction drills in the interview bank. Each audit over-counted — the first listed 28 gaps
and had 3 — so the rule stands: check an audit's claims against the content before writing anything.

**React: down to a handful open.** i18n, state machines and feature flags — once named but not
taught — are now written, and a component sandbox (an in-browser JSX bundler, tested through a real
DOM) added 92 hands-on component exercises across 42 of the 57 chapters. What remains from the
market: the React Compiler, the December 2025 Server Components security advisories, and Actions in
depth are new; streaming SSR, file upload, micro-frontends and React Native each still deserve a
section. Separately, 9 of 57 chapters still open into no exercise — mostly the ones that fit a
different format instead (fiber and effect timing have step-through visualisers; server components
and rendering strategies are server-only; the interview bank, cheat sheet and judgement-practice
chapters are reference, not practice).

**System Design: the largest gap inside a written topic.** No frontend track, no GenAI track, no cheat
page, zero exercises across 61k words. The exercise format is a prompt and a rubric, not a test
runner. The two "(surface)" chapters still have no code blocks, where a minimal Raft state machine
would earn its place.

**Interview book: two separate problems.** Five rounds — TypeScript, Next.js, Node/Nest,
Databases/Redis, AWS/Docker/CI-CD — have no written topic behind them; the P0 and P1 list closes most
of that. And the book has no round for AI-assisted coding, code comprehension or frontend system
design.

**DSA and Git.** DSA's 15 listed gaps are still unchecked, and it has no cheat page. Git's 8 listed
gaps are unchecked and it has no exercises.

### 0.4 The patterns that repeat across every topic

| Every topic should have  | Has it                 |
| ------------------------ | ---------------------- |
| Runnable exercises       | JavaScript, DSA, React |
| A cheat page             | JavaScript, Git, React |
| An inline interview bank | Git, JavaScript, React |
| A guided project         | JavaScript, React      |

Git's shape — model, internals, commands, workflow, danger zone, interview bank, cheat sheet — is the
template. With 115 P0 chapters ahead, write it down once and build every new topic against it from
the first chapter, rather than retrofitting pieces afterwards the way JavaScript and React were.

**New from the research: practice formats.** Every exercise on the site is "write a function from a
blank file until the tests pass". The loops above also test **machine coding** (build a small UI to a
spec), **code comprehension** (read and fix an existing multi-file project), and **design** (a prompt
answered against a rubric). The sandbox already runs multi-file code; the missing piece is the
exercise shape.

The rest, briefly: per-chapter recall cards for the spaced-repetition review page — the evidence for
combining spaced repetition with active recall keeps holding up ([2025 study][recall]); a placement
test; a prerequisite map; references on advanced chapters; and last-updated stamps, which matter more
now that Next.js 16 changed a default that most existing writing still describes the old way.

---

## 1. Progress that survives the browser

**The single biggest product gap.** Everything a reader earns — chapters read, exercises solved,
streaks, review schedule, narration settings, unsaved editor code — lives in `localStorage` on one
device. Clear the browser and it is gone. Open the site on a phone and it starts from zero.

**What it takes**

- Accounts. Given the stack, the least new machinery is a hosted auth provider with a Postgres
  behind it — Supabase (auth and database together) or Neon with Auth.js are the short paths.
- Tables mirroring what `lib/storage.ts` writes today: `progress` keyed by user and chapter,
  `exercise_progress`, `activity` by day, and `settings`.
- **Migration, not replacement.** A reader with months of localStorage progress must not lose it at
  sign-in. Read local, push once, then treat the server as the source of truth.
- Keep working signed out. The account adds sync; it does not gate reading.

**Where the code already helps:** every progress-aware component reads through `useSyncExternalStore`
via `useProgressValue`, and `progress`, `activity` and `code` each expose `subscribe()`. The storage
layer is one seam — a synced implementation behind it touches no components.

---

## 2. Content pipeline

Chapters are TypeScript files compiled into the bundle, and bodies are HTML strings with no schema. An
editing mistake is caught only by the integrity tests in `tests/content.test.ts`.

With roughly 115 P0 chapters to write, this matters more than it did.

**Options, cheapest first**

1. **A schema.** Zod over the chapter shape, so a malformed chapter fails the build with a useful
   message. Half a day; catches the most common mistake.
2. **MDX files on disk.** One file per chapter, real markdown, components for the callout boxes.
3. **A CMS with ISR.** Publishing stops being a deploy. More moving parts and a monthly bill.

Whichever way this goes, search, sitemap, reading time and progress all read from `lib/content.ts` —
that is the interface to keep stable.

---

## 3. Search that scales

Search fetches a per-topic JSON index on the first keystroke and greps it.

**Trimmed — shipped.** Four indexes had grown past 100 KB gzip. HTML tags were already being stripped;
what made them large was demo `<script>` source indexed as if it were prose, raw HTML entities, and
every word repeated as often as the chapter used it. `components/reader/searchIndex.ts` now indexes
only reader-visible text, decodes entities, and keeps each distinct word once — dropping any word that
already appears inside a longer kept word. Measured on the build:

| Index            | Raw before → after | gzip before → after |
| ---------------- | ------------------ | ------------------- |
| `/notes` (JS)    | 457 → 172 KB       | 148 → **70 KB**     |
| `/system-design` | 394 → 166 KB       | 146 → **69 KB**     |
| `/interview`     | 378 → 152 KB       | 135 → **65 KB**     |
| `/dsa`           | 339 → 130 KB       | 115 → **54 KB**     |
| `/react`         | 293 → 145 KB       | 99 → **57 KB**      |

Search matches exactly the same chapters as before, and `tests/search-index.test.ts` proves it for
every chapter on the site: every kept word is an original word, and every original word is still
findable. The one visible change is the sidebar: it marks which chapters matched instead of showing
how many times, because per-word counts were most of what the trim removed. The same test fails the
build if any topic's index passes 85 KB gzip — raised from 75 on 2026-09-24, after the dry-run-table
and checklist pass across every chapter pushed JS to 76 KB and React and System Design to 74-76 KB on
real content growth, not bloat.

**Next, when it is needed:** the budget test is the trigger. When a topic crosses it, the options are
a precomputed inverted index sharded per topic, or a hosted service (Algolia, Typesense, Meilisearch).

---

## 4. The interview book as a product

27 rounds and 230 questions, with three market-driven rounds to add, is the most obvious thing on the
site to charge for. It needs, in order: accounts (section 1), payments (Stripe, or Razorpay if buyers
are mostly Indian), a gate with free rounds as the sample, and the existing all-rights-reserved
licence on `content/`. Do not start here; everything in this section sits on accounts.

---

## 5. Knowing what readers actually do

Vercel Analytics gives pageviews. The questions that would change the writing — which chapter people
leave from, which exercise is opened and abandoned, whether anyone uses the narrator — need a small
event schema sent to PostHog or Plausible: `chapter_read`, `exercise_run`, `exercise_solved`,
`narration_started`, `search_no_results`.

`search_no_results` is the most valuable: it is a list of chapters that should exist, and it is a
check on section 0.2's priorities from the readers' side rather than the job market's.

---

## 6. Deploy size — now a limit

The Hobby plan's deployment storage reached **11.21 GB of 10 GB**. A weekly GitHub Action
(`.github/workflows/vercel-cleanup.yml`) now deletes all but the live deployment, the five most
recent production and preview deployments, and anything under a day old; the first run took the
count from 121 to 15.

That fixes the total. It does not fix the size of each deployment: `public/wasm/` is still 18 MB —
Pyodide 15 MB, sql.js 1.5 MB, TypeScript's lib files 1.2 MB — copied by
`scripts/copy-wasm-assets.mjs` into every deploy, and loaded only when a reader picks Python or SQL in
the playground.

**Do this now rather than later:** serve Pyodide from its CDN and drop it from the copy step. The
tradeoff is a third-party origin in the CSP and a dependency on their uptime for the Python runner.

---

## 7. Smaller things worth doing

**Three pages still render nothing for a crawler.** Measured on the current build: `/git` emits 42
characters of visible text, `/review` 38 and `/progress` 23. `/problems` emits over 20,000. The Git
guide is still invisible to search engines. The fix is the shape `/architecture` already uses:
server-render the body, keep only the interactive shell as a client component.

**Error service.** Client errors still post to `/api/client-error` and land in the function log: no
grouping, no alerting, and the log expires. `components/ErrorReporter.tsx` is the seam; no error
service is installed. Sentry needs `connect-src` in the CSP and a tunnel route if ad blockers matter.

**Offline reading.** `app/manifest.ts` exists; the service worker does not. The App Router serves RSC
payloads as well as HTML, so caching has to cover both, and the playground's wasm should never be
precached by default.

**Rate limiting.** The edge rule's action and threshold live in the Vercel dashboard and are
deliberately not written in this public repository. Check Firewall → Overview there. Keep
`lib/rateLimit.ts`; the two fail in different ways.

**`Kalam 300`.** `lib/fonts.ts` still loads Kalam at weights 300, 400 and 700. The 300 weight serves a
handful of elements and costs its own font file.

---

## 8. What to do next, and roughly how long

Estimates are focused working days for one person who knows this codebase. The content order is
section 0.2; this is the engineering that should run alongside it.

| #   | Item                  | Effort        | Why here                                               |
| --- | --------------------- | ------------- | ------------------------------------------------------ |
| 1   | Wasm off every deploy | **0.5–1 day** | Deployment storage is already over the plan limit      |
| 2   | Chapter schema        | **0.5 day**   | Before 115 new chapters, not after                     |
| 3   | Server-render `/git`  | **0.5–1 day** | One of the best pages on the site, invisible to search |
| 4   | Error service         | **0.5–1 day** | Wanted before there are accounts to break              |
| 5   | New exercise formats  | **2–3 days**  | Machine coding, code comprehension, design rubrics     |
| 6   | Offline reading       | **2–3 days**  | Content is static; mostly a caching problem            |
| 7   | Accounts and sync     | **5–8 days**  | The biggest product gap, and the biggest commitment    |

**Total: roughly 11 to 17.5 focused days.** The first four come to about two and a half days together
and none depends on another. The search index trim that led this list has shipped (section 3).

**New exercise formats** is the item the research added. The sandbox already runs multi-file code;
the work is an exercise shape for "here is a small project with a bug", "build this UI to a spec, then
compare against a reference", and "answer this design prompt, then check it against a rubric" — the
last one needs no test runner at all.

**Accounts still go last** because they are the only item that adds ongoing work rather than removing
it: a database to keep alive, auth email deliverability, and an account-deletion path. Decide you want
those before starting.

---

## Sources

Primary: [GitHub Octoverse 2025][octoverse] · [Stack Overflow Developer Survey 2025][so] ·
[State of JavaScript 2025][stateofjs] · [Next.js 16][next16] · [Naukri JobSpeak, June 2026][naukri-jun]

Secondary and directional: [Naukri JobSpeak July 2026 summary][naukri-jul] · [InfoQ on State of JS][infoq] ·
[Meta's AI-enabled coding interview][meta] · [Google's AI-assisted coding interview][google] ·
[Where LeetCode still matters][leetcode] · [Front End Interview Handbook][fe-handbook] ·
[GenAI system design interview][genai-sd] · [TypeScript agent frameworks][arcade] ·
[Drizzle vs Prisma][drizzle] · [Docker for JavaScript developers][docker-js] ·
[Cypress vs Playwright][bugbug] · [OWASP Top 10:2025][owasp] · [European Accessibility Act][eaa] ·
[API layers in 2026][api-layers] · [The new junior developer][dice] · [Flipkart frontend SDE2][flipkart] ·
[Spaced repetition and active recall][recall]

[octoverse]: https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/
[so]: https://survey.stackoverflow.co/2025/
[so-tech]: https://survey.stackoverflow.co/2025/technology
[so-ai]: https://survey.stackoverflow.co/2025/ai
[so-press]: https://stackoverflow.co/company/press/archive/stack-overflow-2025-developer-survey/
[stateofjs]: https://2025.stateofjs.com/en-US/libraries/front-end-frameworks/
[infoq]: https://www.infoq.com/news/2026/03/state-of-js-survey-2025
[next16]: https://nextjs.org/blog/next-16
[naukri-jun]: https://www.naukri.com/blog/naukri-jobspeak-white-collar-hiring-grows-6-in-june-2026-ai-ml-and-fresher-hiring-lead-the-charge/
[naukri-jul]: https://www.ownyourcareer.in/blog/naukri-jobspeak-july-2026-it-hiring-ai-jobs-rebound
[meta]: https://www.hellointerview.com/blog/meta-ai-enabled-coding
[google]: https://www.tryexponent.com/blog/google-ai-coding-interview
[leetcode]: https://leetcode.com/discuss/post/8446005/
[fe-handbook]: https://www.frontendinterviewhandbook.com/front-end-system-design
[genai-sd]: https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/
[arcade]: https://www.arcade.dev/blog/typescript-ai-agent-frameworks/
[drizzle]: https://www.hirenodejs.com/blog/drizzle-vs-prisma-nodejs-2026
[docker-js]: https://jsgurujobs.com/blog/docker-for-javascript-developers-in-2026-and-the-infrastructure-skill-missing-from-your-resume-that-s-costing-you-the-senior-role
[bugbug]: https://bugbug.io/blog/test-automation-tools/cypress-vs-playwright/
[owasp]: https://about.gitlab.com/blog/2025-owasp-top-10-whats-changed-and-why-it-matters/
[eaa]: https://www.chromatic.com/blog/developers-guide-to-european-accessibility-act-2025/
[api-layers]: https://pockit.tools/blog/rest-graphql-trpc-grpc-api-comparison-2026/
[dice]: https://www.dice.com/career-advice/the-new-junior-developer-harder-to-land-harder-to-replace
[flipkart]: https://roundz.substack.com/p/flipkart-interview-experience-frontend-engineer-sde2
[recall]: https://www.sciencedirect.com/science/article/abs/pii/S187712972500231X
