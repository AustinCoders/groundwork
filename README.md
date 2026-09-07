# Groundwork

Handwritten web-dev notes, in public — [groundwork.austincoders.com](https://groundwork.austincoders.com)

Notes written while learning, layered bottom to top so nothing uses a word that has not been
explained yet. Every topic opens as a reading path for the level you are at, and every layer that
needs practice links to a code editor that runs the code in the browser and checks it against real
tests.

## What is in here

| Area               | What it is                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Reader**         | Topic covers and chapters — an interactive route with read state, time budget and per-chapter progress        |
| **Interview book** | 23 rounds of a real loop, from the screening formats through system design to the offer number                |
| **Playground**     | A CodeMirror editor running JavaScript, TypeScript, Python (Pyodide) and SQL (sql.js) entirely in the browser |
| **Problems**       | Runnable exercises with test suites, linked from the chapters that teach them                                 |
| **Review**         | Spaced repetition over what you have read                                                                     |
| **Progress**       | Streaks, XP, badges and an activity heatmap, all stored on the device                                         |

Nothing is stored on a server. Progress, theme, narration settings and unsaved code all live in
`localStorage`, which is why every progress-aware component reads through `useSyncExternalStore`
rather than rendering straight from storage.

## Running it

```bash
npm install     # Node 22.11+ (see .nvmrc)
npm run dev     # http://localhost:3000
```

`predev` copies the Pyodide, sql.js and TypeScript-lib runtimes into `public/wasm/` — the playground
needs them and they are deliberately not committed.

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
