---
id: SPEC-accounts-and-feedback
companions:
  - data-model.md
  - privacy-and-consent.md
  - ../../../AGENTS.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Optional accounts, user information and feedback

## Why

The owner wants to learn who reads Groundwork and what is unclear or wrong, and to give readers continuity across devices, as the site grows from a JavaScript notebook into a general developer platform with checks, a placement quiz and mock interviews. Today there is no way to hear from a reader: no account, no database, progress lives only in one browser, and the privacy page promises exactly that. This is an opportunity and a vision, not a mandate: it must add feedback and optional accounts without breaking the promise that the site is free, fast and usable with no sign-up.

## Capabilities

- **CAP-1**
  - **intent:** A reader can leave feedback without an account: a helpful or unclear vote with an optional comment on a chapter, a report of a wrong quiz or check answer, a general feedback form and a feature request, leaving an email only if they want a reply.
  - **success:** On a chapter, a check question and a general form, a signed-out reader submits feedback with no email and the owner sees it with its page, question id and time; a second vote on the same chapter from the same browser replaces the first; the form asks for an email only when the reader ticks that they want a reply.
- **CAP-2**
  - **intent:** A reader can sign in with an email link, Google or GitHub, stay signed in across visits and sign out, and the site works exactly as before for a reader who never does.
  - **success:** A new reader signs in by each method and out again; with no account every feature that works today still works, and no page is blocked or redirected because of sign-in.
- **CAP-3**
  - **intent:** A signed-in reader can set a minimal profile (display name, experience level, target roles, languages and topics they care about, optional country), each field optional and consented separately, and edit or remove any field.
  - **success:** Every profile field can be left empty, changed and cleared; no field is stored without its consent recorded; the profile screen lists what is held and why; no profile field changes what the site shows the reader.
- **CAP-4**
  - **intent:** A signed-in reader's progress, streak, check and placement records and settings follow them across browsers and devices, merged from their local data at first sign-in without loss.
  - **success:** A reader with local progress signs in on a second browser and sees the same marks and records; signing in never removes a mark, a pass or a placement that existed on either side.
- **CAP-5**
  - **intent:** A signed-in reader can export all their data and delete their account and everything linked to it, and the privacy page states exactly what is collected and why.
  - **success:** Export returns a file holding every stored field of the reader; deletion removes the account and linked rows within a stated period and a later sign-in starts empty; the privacy page matches the data model line by line.
- **CAP-6**
  - **intent:** The owner can read, tag, mark answered, approve for public display and export feedback, and see simple aggregates (signups, active readers, most-missed questions, chapters with most unclear votes) with no third-party tracker.
  - **success:** Only the owner role can open the inbox and the aggregates; each aggregate is computed from the stored data and matches a hand count on a seeded dataset; a comment appears publicly only when its author allowed it and the owner approved it.
- **CAP-7**
  - **intent:** A reader is asked for feedback only after real use (after a number of chapters, a pass or a failed check), at most once per prompt kind, and can dismiss a prompt for good.
  - **success:** A new reader sees no prompt before the threshold; after dismissal the same prompt never returns in that browser or on that account.
- **CAP-8**
  - **intent:** A signed-in reader can see the owner's public roadmap and vote on its items, and anyone can see owner-approved feedback and vote counts.
  - **success:** A signed-out visitor sees items, counts and approved comments but cannot vote; a signed-in reader holds at most one vote per item and can withdraw it; no public page or response shows who voted or a commenter's name or email; deleting an account removes its votes.

## Constraints

- Guest-first: login never gates reading, practice, checks, the placement or the mock; no feature is withheld from a reader who does not sign in except syncing, identified feedback and voting; existing local progress is never lost and is offered for import at first sign-in (A2).
- Auth is Supabase Auth with email link, Google and GitHub; there are no passwords (A1).
- Data lives in one Supabase project in Mumbai or the nearest available region, and the privacy page names it (A4).
- Feedback is private to the owner by default; public display needs the author's tick and the owner's approval and never carries name or email; vote counts are public and voter identity is not (A5).
- Privacy-first measurement: keep Vercel Web Analytics and Speed Insights; add no third-party tracker, ad technology, session replay or fingerprinting; no personal data in logs, Sentry, analytics events or URLs.
- Performance: every content page stays statically prerendered and the home page script budget stays; auth and feedback code load lazily on interaction or after idle; auth state is client-side so no page becomes dynamic; server routes exist only where a secret or a write needs them.
- Security: Row Level Security on every table with owner-only reads of user data; feedback writes are rate-limited and spam-protected, with no captcha unless abuse appears (A6); admin access is an explicit server-checked role, never a client flag; secrets stay on the server.
- Sync merges progress marks and quiz records by union (a mark or pass never disappears because of a stale device) and every other key last-write-wins; the server never trusts a client to set another reader's data (`data-model.md`).
- The privacy page is updated and live before any collection starts; every profile field has its own consent; export and delete exist before the profile ships; readers under 18 give nothing beyond what sign-in needs (`privacy-and-consent.md`).
- Anonymous feedback is keyed by a random per-browser id kept in local storage only to dedupe votes; it is not linked to a person and is not linked to an account unless the reader chooses.
- Ship in phases, each shippable alone: 0 anonymous feedback; 1 optional sign-in and profile; 2 progress sync; 3 owner dashboard and insights; 4 public roadmap and voting.
- The architecture chapters, the privacy page and `tests/claims.test.ts` stay true in the same change that adds a route, a key, a table or a stated count; theme tokens only, no comments in source (`AGENTS.md`).

## Non-goals

- No paywall, no social features or public profiles, no leaderboards, no passwords, no ads, no selling or sharing of data, no mandatory login, no marketing mail without a separate opt-in.
- No third-party analytics, session replay or tracking pixels.
- No personalisation from profile data; it feeds only owner insights (A7).
- Readers cannot create roadmap items or see who else voted.
- No rewrite of how content, checks or placement work; they only gain a place to send feedback and to sync their records.

## Success signal

A reader who never signs in notices nothing different except a quiet way to say "this was unclear". A reader who signs in finds their progress on a second device and can see, change and delete everything held about them. The owner opens one page and sees what readers found unclear or wrong, and which chapters and questions to fix first, while the site stays as fast and as private as the privacy page says.

## Assumptions

Proceeded under without the owner's answer; each is overturned by one new entry in `.memlog.md` naming its id.

- **A1 ASSUMPTION, login providers:** email magic link, Google and GitHub, no passwords. Why: wide reach with no password surface. Changing it affects the provider config, redirect list, sign-in screen and subprocessor list.
- **A2 ASSUMPTION, login never mandatory:** every existing feature stays usable signed out and local-first; an account only adds sync, identified feedback and voting. Why: keeps the free, no-sign-up promise. Changing it affects the Guest-first constraint, the mandatory-login non-goal, CAP-2 and the guest e2e test.
- **A3 ASSUMPTION, email optional for feedback:** anonymous feedback is allowed with rate limits and a spam guard; email is asked only for a reply. Why: least friction and least data held. Changing it affects the CAP-1 form, `feedback.email`, abuse limits and consent text.
- **A4 ASSUMPTION, data region:** Mumbai or the nearest available region; the owner accepts Supabase's and Vercel's standard data processing terms before launch. Why: closest to the owner and most readers. Changing it affects project setup, route region and the privacy page.
- **A5 ASSUMPTION, visibility and voting:** feedback private by default, public only with author tick plus owner approval; voting public, sign-in required, one vote per account per item, counts public, voters never. Why: privacy by default with a visible roadmap. Changing it affects CAP-8, the feedback visibility columns, roadmap tables, RLS and consent text.
- **A6 ASSUMPTION, abuse handling:** rate limits, honeypot, caps and a hide action; no captcha at launch. Why: no friction until abuse is real. Changing it affects the feedback route and form.
- **A7 ASSUMPTION, profile use:** profile data feeds only owner insights and never personalises the site. Why: one site for everyone, less processing. Changing it affects CAP-3 and consent wording.
- The owner is the only admin at first and moderation is manual.
- Email links use Supabase's built-in mail in development and a transactional provider on the owner's domain in production.
- Anonymous and signed-in feedback share one table, told apart by whether an account id is present.

## Open Questions

- Which contact address does the privacy page publish for deletion and reply requests? Needed before phase 0 launches.
