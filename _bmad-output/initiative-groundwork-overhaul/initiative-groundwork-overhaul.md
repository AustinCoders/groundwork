---
type: initiative
title: "Groundwork overhaul after the 28 Sep audit"
parent: none
covers: [CAP-1, CAP-2, CAP-3, CAP-4, CAP-5, CAP-6, CAP-7, CAP-8, CAP-9, CAP-10, CAP-11]
after: []
assignee: ""
risk: high
---

# Groundwork overhaul after the 28 Sep audit

## Description

Readers get one consistent, honest, fast site. The work covers:

- the privacy and keyboard fixes;
- a redesign of every topic page onto the shared frame;
- mobile performance;
- one frame, token scale and test base underneath.

The spec at `_bmad-output/specs/spec-groundwork-overhaul/SPEC.md` owns the capabilities, constraints and non-goals.

## Outcome

Readers on phones and keyboards move through any topic in the same frame as the rest of the site. The spec's success signal (the three-tap phone walk, mobile Lighthouse ≥ 90, axe in all nine themes) holds.

## Done when

1. The spec's success signal passes on production: the phone walk, Lighthouse mobile ≥ 90 on the CAP-5 pages, and axe clean in all nine themes.
2. Every capability CAP-1 to CAP-11 is live on `main` and deployed, with no flag.
3. The roadmap phases Audit fixes, Redesign every topic page, Fast on phones and One system underneath read all done in `docs/roadmap.html`.
4. `npm run check`, `npm run build` and `npm run test:e2e` pass on `main` after the last merge.

## Boundaries

This covers the Next.js app in this repo: routes under `app/`, `components/`, `lib/`, `content/` copy (no new chapters), `next.config.ts`, tests, CI, the README, `docs/ROADMAP.md` and `.cspell/`. It excludes writing new content, any backend, accounts or paid features, and major tooling upgrades (see the spec's Non-goals).

- Touch point: `content/architecture/`, the How this is built chapters that describe the reader, routes, CI and counts. Owner: every epic whose entry changes what a chapter states (spec Constraints), and each entry names the file.
- Touch point: `docs/roadmap.html` and its artifact — each finished story ticks its roadmap task; owner: every epic.
- Touch point: Vercel, Sentry, Search Console and Bing settings (DSN, domain verification, sitemap submission), done by the user. Owner: epic-audit-fixes.

Tracer path across epics: the JavaScript cover renders inside the shared topic frame (topic redesign, entry 1). Everything else in the topic epic and the one-system epic converges on that frame.

## References

- spec — _bmad-output/specs/spec-groundwork-overhaul/SPEC.md, Capabilities, Constraints and Non-goals
- spec — _bmad-output/specs/spec-groundwork-overhaul/capability-map.md
- audit — _bmad-output/planning-artifacts/audit-2026-09-28/README.md
- roadmap — docs/roadmap.html, phases Audit fixes, Redesign every topic page, Fast on phones, One system underneath
- analysis — _bmad-output/planning-artifacts/audit-2026-09-28/roadmap-analysis.md, Recommended order

## Notes

- Decision: no platform-baseline epic. The repo is brownfield, and its scaffold, CI, Vercel deploys and test suites already run (agent, 2026-09-28; confirm).
- Assumption: epics are built in the order in `tickets.toml`, one story per session with `bmad-build`, each on its own `feature/<name>` branch.
- Decision: epics run audit fixes → topic redesign → fast on phones → one system, because each later epic edits files the earlier one changes first (see each `after` in `tickets.toml`). This replaces the order in roadmap-analysis.md, which put the quick performance wins before the redesign. Those wins can still be pulled forward at epic 3's inception, pinned only on epic 1 (agent, 2026-09-28; confirm).
- Open question: the spec's four open questions. The widget and question-count questions block specific entries, and those entries say which. The GraphQL, Redis and Kubernetes sizes also affect epic 1 entry 4.
- Decision: epic-theme-palettes (id 5) runs first, ahead of the audit fixes, because the user asked for the palettes before the plan (2026-09-28).
- Open question: every `Decision (agent; confirm)` line in the epics is unconfirmed until the user says so, including the no-baseline decision above.
