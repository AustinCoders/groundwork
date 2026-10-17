<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## groundwork

A free study site for JavaScript and interview prep: notes, runnable exercises, an interview book, mock interviews and a whiteboard. Next.js 16 App Router, React 19, TypeScript, CSS modules, no backend; progress lives in localStorage.

## Policy

- Do each task on its own `feature/<name>` branch cut from an up-to-date `main`; never commit to `main` directly.
- Merge by fast-forwarding `main` and pushing `origin` (the AustinCoders remote); then delete the branch locally and on GitHub.
- Commit, push or merge only when the user asks; commits stay authored as akshataustin, with no AI co-author trailer.
- Planned and open work lives in `docs/ROADMAP.md`; keep it current when something is built or dropped.
- Never stop or reuse the user's dev server on port 3000; run your own on another port (e2e uses 3100).

## Running and verifying

- Use Node 24 (`.nvmrc`): the default shell here is Node 22, so prefix commands with `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH`.
- There is no CI service: nothing runs the checks unless you do. `npm run check` (typecheck, lint, comments, format, spell, unit tests) skips the build and e2e. `npm run build` then `npm run test:e2e` runs the one small Playwright smoke spec (about 19 tests, around ten seconds) against the production build on port 3100.
- The unit tests (`npm test`) carry most of the checking, including `tests/claims.test.ts` (numbers in the "How this is built" chapters) and the contrast and theme tests. The old browser suite (axe in nine themes, composition probes, per-page specs) was cut; layout, focus and hydration on the pages it covered are checked by looking.
- Lighthouse budgets (`.lighthouserc.json`) run only on request: `npm run build && npm run test:perf`.
- Tip: pushing a branch makes Vercel build a preview; its commit status `Vercel` shows whether it built, and it links the preview URL to open.
- The pre-push hook and `npm run check` run `npm run comments`.

## Conventions that differ from defaults

- Write no comments in source; `npm run comments` fails them. Name things so the code explains itself.
- Style with theme tokens (`--ink`, `--sheet`, `--paper`, `--line`, `--c-*`), never hex or white; all nine themes and the a11y contrast test depend on it.
- Append new spelling words to the end of `.cspell/project-words.txt`; never re-sort it.

## Content standard

Every chapter, new or rewritten, follows `docs/content-standard.md`. In short:

- Write 3,500 to 5,000 words of prose and never more than 6,000; `tests/chapter-standards.test.ts` fails a longer new chapter and stops an older long one from growing. Outline the sections first, then write the body.
- Cover six things: depth (derive the idea, one hand-traced worked example, complexity with its reason, pitfalls), accuracy (run every code block and check every number, version and API claim for 2026), clarity (no placeholders, no concept used before it is taught), practice (exercises with 6+ tests and 3 hints, a 5-question self-check), a visual where a picture explains, and interview questions with written model answers and follow-ups.
- Do not type counts into the "How this is built" chapters by hand; run `npm run claims:sync` after content changes and it rewrites them.
- Working with agents: at most 5 or 6 at a time, a cheaper model for mechanical work (wiring, formatting, exercise typing), a short brief that points here instead of pasting this file, review only the diff and only theory and prose (the author already ran the code), merge with one script and an explicit file list per group.

## Session handoff

Long chats get expensive because every message re-reads the whole context. Keep sessions short: one big task per session.

- At the start of a session, read `docs/handoff.md` and the memory index before anything else.
- At the end of every big task (a merge, a batch of chapters, a redesign), update `docs/handoff.md`: what happened, what is left, which commands to run, in five lines or fewer per section. Then tell the owner it is safe to clear the chat.
- Put decisions in the handoff, memory or `docs/content-standard.md`, not only in the chat, so clearing loses nothing.

## Known pitfalls

- Numbers stated in `content/architecture/` are asserted by `tests/claims.test.ts`; update the chapter when a count changes.
- Scroll reveals leave elements part-transparent mid-animation; any contrast or visibility check in a browser needs reduced motion on.
