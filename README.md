# Groundwork

Handwritten web-dev notes, in public — [groundwork.austincoders.com](https://groundwork.austincoders.com)

Notes written while learning, layered bottom to top so nothing uses a word that has not been
explained yet. Every topic opens as a reading path for the level you are at, and every layer that
needs practice links to a code editor that runs the code in the browser and checks it against real
tests.

## What is in here

| Area               | What it is                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Reader**         | Topic covers and chapters — an interactive route with read state, time budget and per-chapter progress                           |
| **Interview book** | 27 rounds of a real loop, from the screening formats through system design to the offer number                                   |
| **Playground**     | A CodeMirror editor running JavaScript, TypeScript, Python (Pyodide) and SQL (sql.js) entirely in the browser                    |
| **Problems**       | Runnable exercises with test suites, linked from the chapters that teach them                                                    |
| **Mock interview** | A full loop for your role, level and company type — timed, with follow-ups, coding graded by tests and a committee-style debrief |
| **Review**         | Spaced repetition over what you have read                                                                                        |
| **Progress**       | Streaks, XP, badges and an activity heatmap, all stored on the device                                                            |

Nothing is stored on a server. Progress, theme, narration settings and unsaved code all live in
`localStorage`, which is why every progress-aware component reads through `useSyncExternalStore`
rather than rendering straight from storage.

## Running it

```bash
npm install     # Node 22.11+ (see .nvmrc)
npm run dev     # http://localhost:3000
```

`predev` copies the TypeScript lib files into `public/wasm/` — the playground needs them and they
are deliberately not committed. Pyodide and sql.js are fetched from jsDelivr at the versions pinned
in `package.json`, which keeps 16.5 MB out of every deployment; `node scripts/copy-wasm-assets.mjs
--all` writes them into `public/wasm/` instead, for self-hosting with `NEXT_PUBLIC_PYODIDE_BASE` and
`NEXT_PUBLIC_SQL_JS_BASE`.

## Error tracking

Client and server errors go to Sentry when `NEXT_PUBLIC_SENTRY_DSN` is set, which also opens the
Content-Security-Policy to that host. Without it the SDK is never imported — it compiles into a chunk
no page loads — and errors fall back to `/api/client-error`, which writes them to the server log.

## Checks

```bash
npm run check   # typecheck + lint + format + spelling + tests
```

Or individually: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run spell`,
`npm test`. The same set runs in CI on every push and pull request, plus a production build.

A pre-commit hook runs eslint, prettier and the spell checker over staged files only.

## Layout

```
app/          routes — one folder per topic, plus /practice /problems /review /progress
components/   Shell (sidebar), reader/, practice/, and shared widgets
content/      the notes themselves — chapters, exercises, interview rounds, topic metadata
lib/          storage, content helpers, code runners, gamification, fonts
tests/        content integrity — every chapter and exercise is checked structurally
```

Adding a chapter means adding it to the topic's notes file in `content/`; routes, search index,
sitemap and progress tracking all read from there.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · plain CSS with theme tokens ·
CodeMirror 6 · Pyodide · sql.js · Vitest · deployed on Vercel.

## What is next

[docs/ROADMAP.md](docs/ROADMAP.md) — what is left to build and in what order, with the numbers the
audit measured.

## Licence

The code is MIT. The writing under `content/` is not — see [LICENSE](LICENSE).
