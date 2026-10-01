<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- bmad:context -->
<!-- Verified 2026-09-28 against a5ca1c2. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## groundwork

A free study site for JavaScript and interview prep: notes, runnable exercises, an interview book, mock interviews and a whiteboard. Next.js 16 App Router, React 19, TypeScript, CSS modules, no backend; progress lives in localStorage. BMad planning output lives in `_bmad-output/`, and it is committed.

## Policy

- Do each task on its own `feature/<name>` branch cut from an up-to-date `main`; never commit to `main` directly.
- Merge by fast-forwarding `main` and pushing `origin` (the AustinCoders remote); then delete the branch locally and on GitHub.
- Commit, push or merge only when the user asks; commits stay authored as akshataustin, with no AI co-author trailer.
- Never edit `.claude/skills/` or `_bmad/`; update them with `npx skills update`, then run the `bmad` skill's setup.
- Never stop or reuse the user's dev server on port 3000; run your own on another port (e2e uses 3100).

## Running and verifying

- Use Node 24 (`.nvmrc`): the default shell here is Node 22, so prefix commands with `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH`.
- `npm run check` is the pre-merge gate, but it skips the build and e2e; run `npm run build` before `npm run test:e2e`, which serves the production build.
- CI, the pre-push hook and `npm run check` all run `npm run comments`.

## Conventions that differ from defaults

- Write no comments in source; `npm run comments` fails them. Name things so the code explains itself.
- Style with theme tokens (`--ink`, `--sheet`, `--paper`, `--line`, `--c-*`), never hex or white; all nine themes and the a11y contrast test depend on it.
- Append new spelling words to the end of `.cspell/project-words.txt`; never re-sort it.

## Known pitfalls

- Numbers stated in `content/architecture/` are asserted by `tests/claims.test.ts`; update the chapter when a count changes.
- Scroll reveals leave elements part-transparent mid-animation; run axe checks with reduced motion or contrast fails at random.

<!-- /bmad:context -->
