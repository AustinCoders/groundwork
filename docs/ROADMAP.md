# Roadmap

What is left to build, in the order it is worth building. Every number here was measured against the
site, not estimated. Last measured September 2026.

The site is production-ready as it stands: 559 prerendered pages on a CDN, security headers, and CI
that typechecks, lints, spell-checks, runs unit tests, a Playwright smoke and accessibility suite,
and Lighthouse budgets. Nothing below is broken. It is what the site needs in order to grow.

A visual version of this file, with progress bars, is [`roadmap.html`](roadmap.html).

---

## 0. Content — the half the engineering serves

Measured today: **4 of 20 topics have written chapters** — 112 written, 399 still outlines.

| Topic          | Written      | Exercises |
| -------------- | ------------ | --------- |
| DSA in JS      | 34           | 245       |
| JavaScript     | 27           | 54        |
| Interview book | 27 rounds    | **0**     |
| System Design  | 24           | **0**     |
| The other 16   | outline only | —         |

The interview book is 27 rounds and 405 questions, eleven of them carrying a level ladder.

Two things stand out.

**System Design and the Interview book have no practice at all.** They are the two tracks most tied
to getting hired and the two where a reader cannot do anything but read. Exercises for these do not
look like the DSA ones — a system design "exercise" is a prompt and a rubric, an interview one is a
question with a model answer to compare against. That is a content format decision before it is a
code one.

**Sixteen topics are outlines.** They render, they sit in "More topics", and they say so honestly.
Which to write next is a question about who the site is for; the interview loop already names the
rounds that matter most, and React, Node and TypeScript are the three that appear in nearly every
job description this site is aimed at.

There is no engineering blocker on any of this. Adding a chapter means adding a file under
`content/<topic>/`; routes, search index, sitemap, reading time and progress all follow from there.

---

## 1. Progress that survives the browser

**The single biggest product gap.** Everything a reader earns — chapters read, exercises solved,
streaks, review schedule, narration settings, unsaved editor code — lives in `localStorage` on one
device. Clear the browser and it is gone. Open the site on a phone and it starts from zero.

That is fine for a personal notes site and wrong for anything with readers.

**What it takes**

- Accounts. Given the stack, the least new machinery is a hosted auth provider with a Postgres
  behind it — Vercel is already the host, so Supabase (auth and database together) or Neon with
  Auth.js are the short paths.
- Tables mirroring what `lib/storage.ts` writes today: `progress` keyed by user and chapter with
  done-at and review count, `exercise_progress`, `activity` by day, and `settings` for theme, font,
  level and narration.
- **Migration, not replacement.** The reader who already has six months of localStorage progress
  must not lose it at sign-in. Read local, push once, then treat the server as the source of truth.
- Keep working signed out. The whole site is readable without an account today and should stay that
  way; the account adds sync, it does not gate reading.

**Where the code already helps:** every progress-aware component reads through `useSyncExternalStore`
via `useProgressValue`, and `progress`, `activity` and `code` each already expose `subscribe()`. The
storage layer is one seam — a synced implementation behind it touches no components.

---

## 2. Content pipeline

Chapters are TypeScript files compiled into the bundle. Every typo fix is a rebuild and a redeploy.

The size half of this problem is solved: the four files that had grown past editing — `practice.ts`
at 840 KB, `dsa-notes.ts` at 626 KB, `system-design-notes.ts` at 577 KB and `notes.ts` at 306 KB —
are now barrels over per-chapter files, and the largest hand-edited content files left are
`interview-data.ts` at 429 KB and `topics.ts` at 165 KB.

**What still hurts**

- No preview of a chapter without running the dev server.
- Chapter bodies are HTML strings, so an editing mistake is only caught by the integrity tests in
  `tests/content.test.ts`, not by a schema.

**Options, cheapest first**

1. **A schema.** Zod over the chapter shape, so a malformed chapter fails the build with a useful
   message rather than rendering oddly. Smallest change, catches the most common mistake.
2. **MDX files on disk.** One file per chapter, real markdown, components for the callout boxes.
   Keeps everything in git, no service to run.
3. **A CMS with ISR.** Content moves out of the repo; publishing stops being a deploy. More moving
   parts and a monthly bill.

Whichever way this goes, the search index, sitemap, reading-time estimates and progress tracking all
read from `lib/content.ts` — that is the interface to keep stable.

---

## 3. Search that scales

Search fetches a per-topic JSON index in the browser and greps it. It is fetched lazily, on the first
keystroke rather than on page load, so it costs nothing to a reader who never searches.

Measured payloads:

| Index        | Raw    | gzip       |
| ------------ | ------ | ---------- |
| `/interview` | 378 KB | **134 KB** |
| `/dsa`       | 339 KB | **115 KB** |
| global       | 25 KB  | 6.6 KB     |
| `/css`       | 1.9 KB | 0.6 KB     |

**Where it breaks:** two topics already cost over 100 KB gzip on the first keystroke, and both are
the ones a reader is most likely to search. Every written topic adds another.

**Options**

- Trim what goes into the index — strip HTML, cap the text kept per chapter. Cheapest, roughly halves
  it, changes nothing else.
- A precomputed inverted index, term to chapter ids, sharded per topic — no service, more code.
- A hosted search service (Algolia, Typesense, Meilisearch). Costs money, gives typo tolerance and
  ranking for free, and is the right answer if search becomes something readers rely on.

Do the trim now. Revisit when a third topic crosses 100 KB.

---

## 4. The interview book as a product

The interview material is 27 rounds and 405 questions written to a standard that people pay for. It
is the most obvious thing on the site to charge for.

**What that needs, in order**

1. Accounts (section 1) — nothing else works without them.
2. Payments. Stripe, one-time or subscription; Razorpay if the buyers are mostly Indian.
3. A gate. Free rounds as the sample, the rest behind sign-in. The cover page already reads like a
   shelf, so the split is a content decision, not a rebuild.
4. A licence decision. `LICENSE` currently reserves all rights on `content/`, which is the right
   default and should stay that way if it becomes paid.

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

**Rate limiting: one step left.** All four API routes carry a per-instance limiter, and a Vercel
Firewall rule now sits in front of them at the edge, matching `Request Path starts with /api/` on a
fixed window keyed by IP.

The remaining step is a dashboard toggle, not a task. The rule's current action, the exact threshold
and the review date are not written down here — this file is in a public repository, and live
enforcement settings are the one thing in it that would be useful to somebody probing the site. They
live in the Vercel dashboard, which is where they are authoritative anyway. Firewall → Overview shows
the **Rate Limited** figure and the rule editor shows the rest.

Note that Firewall counters are regional rather than global, so this is a much higher wall than the
in-process limiter, not an absolute one. Keep `lib/rateLimit.ts`: it runs in the function, the
Firewall runs at the edge, and they fail in different ways.

**Sentry.** Client errors currently post to `/api/client-error` and land in the Vercel function log:
no grouping, no alerting, and the log expires. `components/ErrorReporter.tsx` and the endpoint are
already the seam. Note that the CSP has blocked a third-party script before — Sentry needs
`connect-src`, and a tunnel route if ad blockers are a concern.

**Offline reading.** A service worker over the chapters would make the site work on a train.
`app/manifest.ts` already exists, so this is the worker and a cache strategy — and a decision about
what "offline" means for the playground, which needs its 18 MB of wasm runtimes. The fiddly part is
that the App Router serves RSC payloads, not only HTML, so the caching rules have to account for
both.

**`Kalam 300`.** The light weight exists for `.sub` and `.brand__meta` — around six elements on a
page — and costs its own font file, roughly 13 KB of the 145 KB a chapter page loads. Moving those to
400 drops the file. It is a design decision, not a technical one: the subtitle gets slightly heavier.

---

## 8. What to do next, and roughly how long

Estimates are focused working days for one person who knows this codebase. They cover building,
testing and shipping, not learning a service from scratch.

### Ordered by what to pick up first

| #   | Item              | Effort        | Why here                                            |
| --- | ----------------- | ------------- | --------------------------------------------------- |
| 1   | Search index trim | **0.5 day**   | Halves the two indexes that already cost 100 KB+    |
| 2   | Sentry            | **0.5–1 day** | Wanted before there are accounts to break           |
| 3   | Offline reading   | **2–3 days**  | Content is already static; mostly a caching problem |
| 4   | Accounts and sync | **5–8 days**  | The biggest gap, and the biggest commitment         |

**Total: roughly 8 to 13 focused days.** The first two come to about a day together and are
independent of each other.

### 1. Search index trim — half a day

Strip HTML from the indexed text and cap what is kept per chapter, then re-measure `/dsa` and
`/interview`. Target is under 60 KB gzip each. No interface changes: `ReaderShell` fetches the same
URL and greps the same shape.

### 2. Sentry — half a day to a day

- `@sentry/nextjs`, DSN in the environment, source maps uploaded from CI.
- `ErrorReporter` calls `Sentry.captureException` instead of posting to `/api/client-error`.
- Update the CSP for `connect-src`, and add a tunnel route if reports are being blocked.

Free tier covers this traffic comfortably.

### 3. Offline reading — 2 to 3 days

- A service worker (Serwist is the maintained option) precaching the app shell.
- Runtime caching for visited chapters, covering both the HTML and the RSC payload.
- A decision on the playground: either leave it online-only or make the wasm runtimes an explicit
  "download for offline" action. Do not precache 18 MB by default.
- An offline indicator and a fallback page for an uncached route.

Most of the time goes on the App Router caching rules and testing them, not on the worker itself.

### 4. Accounts and progress sync — 5 to 8 days

- Provider, schema and auth flow — 1 to 2 days.
- The synced storage layer behind the existing seam — 2 days. Components do not change.
- Migration from localStorage, signed-out behaviour, and the edge cases around both — 1 to 2 days.
- Playwright coverage with a test account, and CI — 1 day.

This is the only item on the list that adds ongoing work rather than removing it: a database to keep
alive, auth email deliverability, and an account-deletion path. Worth deciding that you want those
before starting, because they do not go away.
