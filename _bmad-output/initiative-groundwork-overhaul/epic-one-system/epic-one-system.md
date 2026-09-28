---
type: epic
title: "One system underneath"
parent: initiative-groundwork-overhaul
covers: [CAP-8, CAP-9, CAP-10]
after: []
assignee: ""
risk: medium
---

# One system underneath

## Description

The rest of the site converges on the frame the topic redesign builds: Home, Problems, the Playground, the whiteboard, Mock and the interview book. After that:

- `globals.css` is split and loses about 1,200 dead lines;
- tokens and the type scale get one meaning each;
- the two 1,600-line components are broken up;
- the CSP drops `'unsafe-eval'` where no runner needs it, and CDN runtimes are pinned with integrity hashes;
- progress and review logic gets unit tests, and e2e gains a mobile project;
- dead code and the unused Tailwind setup go, and storage gets one layer with a version;
- the hard-coded "JS" brand mark becomes topic-neutral (ux-a11y.md N3, roadmap t20).

Of CAP-8, CAP-9 and CAP-10, this epic delivers everything except three parts owned elsewhere: Shell's deletion (epic-topic-redesign entry 10), Sentry in production (epic-audit-fixes entry 7) and the CI comments check (epic-audit-fixes entry 6). It also owns the Playwright mobile project; epic-audit-fixes entry 3 only sets a viewport inside the a11y spec.

## Outcome

The author changes the header, a token or a storage key in one place, and every page follows. The signal is CAP-8 plus the tested, pinned runtime in CAP-9 and CAP-10.

## Done when

1. One header component renders on every route. `BookShell.tsx` and the per-page headers in Mock, Problems, the Playground and the whiteboard are gone.
2. `globals.css` has no rule for a class nothing renders, checked by a script over the build output.
3. `--primary` and the radius tokens mean one value per theme everywhere, and the font sizes come from one scale.
4. `script-src` has no `'unsafe-eval'` on pages without a code runner, and every CDN runtime URL carries a pinned version and an integrity hash.
5. Unit tests cover `lib/storage.ts` progress and review scheduling. e2e runs a mobile project and every written topic's reader.
6. No source file in `app/` or `components/` exceeds 800 lines. `Board` and `PracticeWorkspace` are split.
7. Every localStorage key goes through one storage module carrying a schema version, and the unused exports, components and Tailwind setup are gone (knip or the equivalent reports none).
8. Deployed from `main` with `npm run check`, `npm run build` and `npm run test:e2e` green.

## Boundaries

Structure and safety under pages that already look right. It does not redesign any page. Its visual changes are limited to what one frame and one scale force.

## References

- spec — _bmad-output/specs/spec-groundwork-overhaul/SPEC.md, CAP-8, CAP-9, CAP-10
- audit — _bmad-output/planning-artifacts/audit-2026-09-28/code-quality.md, findings 1–5, 8–10 and 13–14 (finding 15 is delivered by epic-topic-redesign entry 10)
- audit — _bmad-output/planning-artifacts/audit-2026-09-28/ux-a11y.md, N1, V1–V3
- roadmap — docs/roadmap.html, phase One system underneath (t75–t82)

## Notes

- Waits on epic-topic-redesign because: the final shared frame, with Shell deleted (entry 10), is what the rest of the site converges on.
- Waits on epic-audit-fixes because: the CSP work starts from the Sentry origin (entry 7), and the test work extends the hardened CI (entry 6) and the a11y harness (entry 3).
- Waits on epic-fast-on-phones because it touches the same files first: the CSS split and `cssChunking`, the Playground and mock-room changes, and the Radix removal.
- Decision: the frame decision's home is epic-topic-redesign entry 1, not the opening epic. That is acceptable because this epic, the only other adopter, waits on epic 2 (agent, 2026-09-28).
- Unknown: whether a nonce-based CSP is possible with every page static. If not, the CSP work narrows to per-route headers.
