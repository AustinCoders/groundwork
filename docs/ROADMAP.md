# Roadmap

What is left to build, in the order it is worth building. Written September 2026, after the
production audit — every number in here was measured against the live site, not estimated.

The site is production-ready as it stands: 567 static pages on a CDN, security headers, CI that
typechecks, lints, spell-checks, runs unit tests, a Playwright smoke and accessibility suite, and
Lighthouse budgets. Nothing below is broken. It is what the site needs in order to grow.

---

## 0. Content — the half the engineering serves

Measured today: **4 of 20 topics have written chapters.**

| Topic          | Chapters     | Exercises |
| -------------- | ------------ | --------- |
| JavaScript     | 27           | 54        |
| DSA in JS      | 34           | 245       |
| System Design  | 24           | **0**     |
| Interview book | 23           | **0**     |
| The other 16   | outline only | —         |

Two things stand out.

**System Design and the Interview book have no practice at all.** They are the two tracks most tied to
getting hired and the two where a reader cannot do anything but read. Exercises for these do not look
like the DSA ones — a system design "exercise" is a prompt and a rubric, an interview one is a
question with a model answer to compare against. That is a content format decision before it is a
code one.

**Sixteen topics are outlines.** They render, they sit in "More topics", and they say so honestly.
Which to write next is a question about who the site is for; the interview loop already names the
rounds that matter most, and React, Node and TypeScript are the three that appear in nearly every
job description this site is aimed at.

There is no engineering blocker on any of this. Adding a chapter means adding it to the topic's notes
file in `content/`; routes, search index, sitemap, reading time and progress all follow from there.

## 1. Progress that survives the browser

**The single biggest product gap.** Everything a reader earns — chapters read, exercises solved,
streaks, XP, review schedule, narration settings, unsaved editor code — lives in `localStorage` on
one device. Clear the browser and it is gone. Open the site on a phone and it starts from zero.

That is fine for a personal notes site and wrong for anything with readers.

**What it takes**

- Accounts. Given the stack, the least new machinery is a hosted auth provider with a Postgres
  behind it — Vercel is already the host, so Neon or Supabase are the short paths.
- A `progress` table keyed by user and chapter, mirroring what `lib/storage.ts` writes today:
  chapter done + timestamp + review count, exercise solved, activity days, streak.
- **Migration, not replacement.** The reader who already has six months of localStorage progress
  must not lose it at sign-in. Read local, push once, then treat the server as the source of truth.
- Keep working signed out. The whole site is readable without an account today and should stay that
  way; the account adds sync, it does not gate reading.

**Where the code already helps:** every progress-aware component reads through `useSyncExternalStore`
via `useProgressValue`, so the storage layer is one seam. Swapping `lib/storage.ts` for a synced
implementation does not touch the components.

---

## 2. Content pipeline

Chapters are TypeScript files compiled into the bundle. `content/interview-data.ts` alone is twelve
thousand lines, and `content/practice.ts` is larger. Every typo fix is a rebuild and a redeploy.

**What hurts today**

- No preview of a chapter without running the dev server.
- The two biggest content files are prettier-ignored because formatting them is a four-thousand-line
  diff that changes nothing — a sign the format is fighting the tooling.
- Chapter bodies are HTML strings, so an editing mistake is only caught by the integrity tests in
  `tests/content.test.ts`, not by a schema.

**Options, cheapest first**

1. **MDX files on disk.** One file per chapter, real markdown, components for the callout boxes.
   Keeps everything in git, no service to run. Biggest win per hour of work.
2. **A CMS with ISR.** Content moves out of the repo; publishing stops being a deploy. More moving
   parts and a monthly bill.
3. **Stay as-is but add a schema.** Zod over the chapter shape, so a malformed chapter fails the
   build with a useful message rather than rendering oddly.

Whichever way this goes, the search index, sitemap, reading-time estimates and progress tracking all
read from `lib/content.ts` — that is the interface to keep stable.

---

## 3. Search that scales past twenty topics

Search fetches a per-topic JSON index in the browser and greps it. It works because a topic index is
small and there are twenty topics.

**Where it breaks:** every new topic adds a payload; cross-topic search already pulls the global
index. Somewhere past a few hundred chapters this stops being reasonable to ship to a phone.

**Options**

- Precomputed inverted index, sharded per topic, loaded on demand — no service, more code.
- A hosted search service (Algolia, Typesense, Meilisearch). Costs money, gives typo tolerance and
  ranking for free, and is the right answer if search becomes something readers rely on.

Worth doing when a search misses something a reader knows is there.

---

## 4. The interview book as a product

The interview material is 23 rounds and 354 questions written to a standard that people pay for. It
is the most obvious thing on the site to charge for.

**What that needs, in order**

1. Accounts (section 1) — nothing else works without them.
2. Payments. Stripe, one-time or subscription; Razorpay if the buyers are mostly Indian.
3. A gate. Free rounds as the sample, the rest behind sign-in. The current cover page already reads
   like a shelf, so the split is a content decision, not a rebuild.
4. A licence decision. `LICENSE` currently reserves all rights on `content/`, which is the right
   default for this and should stay that way if it becomes paid.

Do not start here. Do section 1 first; everything in this section sits on it.

---

## 5. Knowing what readers actually do

Vercel Analytics gives pageviews. It cannot answer the questions that would change the writing:

- Which chapter do people leave from, and at what scroll depth?
- Which exercise gets opened and abandoned without a run?
- Does anyone use the narrator past the first chunk?
- Does the reading-time budget on the cover page change what people read?

**What it takes:** a small event schema and somewhere to send it — PostHog and Plausible both have
event APIs and a free tier. The events worth having are few: `chapter_read`, `exercise_run`,
`exercise_solved`, `narration_started`, `search_no_results`. Send them from the same places that
already write to `lib/storage.ts`.

`search_no_results` is the highest-value one on that list: it is a list of chapters that should exist
and do not.

---

## 6. Deploy size

`public/wasm/` is 18 MB — Pyodide 15 MB, sql.js 1.5 MB, the TypeScript lib files 1.2 MB — copied in
at build time by `scripts/copy-wasm-assets.mjs` and shipped with every deploy.

None of it loads unless a reader picks Python or SQL in the playground, so it costs nothing at
runtime. It costs build time and deploy size.

**If that starts to matter:** point Pyodide at its own CDN and drop the copy step. The tradeoff is a
third-party origin in the CSP and a dependency on their uptime for the Python runner.

---

## 7. Smaller things worth doing

**Rate limiting that actually holds.** `/api/tts` has a per-instance limiter, which is a floor, not
a guarantee — serverless spreads traffic over instances. Vercel Firewall rate limiting is the
account-wide version and is configuration rather than code.

**Sentry.** Client errors currently post to `/api/client-error` and land in the Vercel function log:
no grouping, no alerting, and the log expires. Swapping in a real error tracker is one function —
the reporting component and endpoint already exist as the seam.

**`Kalam 300`.** The light weight exists for `.sub` and `.brand__meta` — around six elements on a
page — and costs its own font file, roughly 13 KB of the 145 KB a chapter page loads. Moving those
to 400 drops the file. It is a design decision, not a technical one: the subtitle gets slightly
heavier.

**Home page JavaScript.** Lighthouse measures 650 KB of script on `/` against 251 KB on a chapter
page. Worth finding out what the difference is; the performance score is 100 either way, so it is
curiosity rather than a problem.

**Offline reading.** A service worker over the chapters would make the site work on a train. The
content is static and already cached hard, so this is mostly about a manifest and a cache strategy —
and about deciding what "offline" means for the playground, which needs its wasm runtimes.

---

## Earlier audit

[`2026-08-audit.html`](2026-08-audit.html) is the August audit, kept as a snapshot rather than
maintained. Nearly everything engineering in it is now done — chapter `<h1>`s, security headers,
sitemap and robots, cross-topic search, error boundaries, per-chapter routes, tests and CI, the
focus-stealing search box, the editor chunk splitting out of the reader bundle, analytics. What is
still open from it lives in this file: the unofficial Microsoft dependency behind narration, offline
support, and the content plan above.

## What was finished in the audit pass

Kept here so nobody re-does it.

| Area           | Result                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------- |
| Reader load    | 623 KB / 56 requests → 470 KB / 26; RSC prefetch 25 → 0                                      |
| Dynamic routes | `/practice`, `/level`, `/soon` were server-rendered per request; all static now              |
| `/api/tts`     | base64 JSON with `no-store` → binary mp3, CDN-cached, rate-limited                           |
| `/api/weather` | Coordinates round to one decimal, so a city shares one upstream call                         |
| CSP            | Vercel Analytics and Speed Insights were blocked by our own policy                           |
| Layout shift   | Sidebar accordion opened after mount; CLS on `/interview` 0.116 → 0.030                      |
| Accessibility  | axe over 12 pages: tablist children, an unnamed editor, tag contrast at 3.94:1               |
| Fonts          | 16 families → 6; every remaining weight verified in use; two buttons were rendering in Arial |
| CI             | Now also formatting, spelling, 27 Playwright tests, and Lighthouse budgets                   |
