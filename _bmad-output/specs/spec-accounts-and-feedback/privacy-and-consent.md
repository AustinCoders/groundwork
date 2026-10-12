# Privacy, consent and security

Companion to `SPEC.md`. Not legal advice; the owner confirms the legal points before launch.

## What is collected, by phase

| Phase | Data | Why | Consent |
|---|---|---|---|
| 0 | feedback text, page, chapter or question id, vote, a random per-browser id; email only if the reader asks for a reply; an unticked permission to show the comment publicly | fix unclear or wrong content; reply on request | consent text beside the form; reply and public-display boxes unticked by default |
| 1 | email (from sign-in), provider id, display name; optional experience, target roles, languages, topics, country | sign in; know who the readers are; prioritise topics | one switch per optional field, off by default, stored with a timestamp |
| 2 | progress, streak, check, placement and settings records | continuity across devices | implied by turning sync on, which is asked once and can be turned off |
| 3 | aggregates only | owner insights | covered by the profile and sync consents; no new collection |
| 4 | a vote (item, account, time) | public roadmap counts | signing in and pressing vote; counts are public, the voter never is |

## Never collected

Phone number, date of birth, exact location or IP address stored with a profile, contacts, employer or school, government ids, device fingerprints, the code a reader writes (unless the reader later turns on draft sync), the text of their own notes, and anything from other sites. The profile fields above are the whole list. IP addresses are used only as a salted hash for rate limits and discarded within 24 hours.

## Rules

- Nothing is collected before the privacy page describes it; the privacy page's "no account, no database" sections are rewritten in the story that first collects anything, and its test is updated.
- No cookies for tracking; the auth session uses the library's storage, listed on the privacy page. No third-party trackers, session replay or fingerprinting; Vercel Web Analytics and Speed Insights stay as described today.
- No personal data in logs, Sentry, analytics events or URLs; the feedback route logs only status and timing.
- Minors: a reader who states an age under 18 is not asked for profile fields beyond what sign-in needs, and feedback is not linked to a profile. Confirm the legal threshold for India (DPDP Act) and the EU with the owner's adviser.
- Rights: export (a JSON file of every stored field) and deletion (account, profile, synced records, votes and linked feedback removed or anonymised within 30 days) are in the profile screen and tested; a feedback comment can be deleted by its author while signed in; anonymous feedback is deleted on request to the privacy-page contact address (help@austincoders.com), quoting the reference id or email shown, within 30 days.
- Retention: feedback is kept while it is useful and anonymised after 24 months (email removed, comment unpublished) unless deleted sooner on request to help@austincoders.com; rate-limit hashes 24 hours; deleted accounts leave no personal data behind.
- Marketing mail needs a separate opt-in that this spec does not include.
- Region: data is stored in Mumbai or the nearest available region (A4) and the privacy page names it, with a note that hosting and mail subprocessors may process it elsewhere; the owner accepts the standard data processing terms of Supabase and Vercel before launch.
- Visibility: feedback is private to the owner by default; a comment is shown publicly only if its author ticked permission and the owner approved it, without name or email; vote counts are public and voter identity is not (A5). Profile data feeds only owner insights (A7).

## Consent text (shown beside the feedback form)

> Your feedback is private: only the site owner reads it. We keep the text, the page, and a random id from this browser so one vote counts once. Tick "reply" and we keep your email to answer you; tick "show publicly" and we may show your comment, without your name or email, after review. Ask us to delete it any time at help@austincoders.com (the address on the privacy page), quoting the reference id shown after you send. Data is stored in India (Mumbai) or the nearest available region.

## Security

- Row Level Security on every table, tested with policy tests; the service key never reaches the browser.
- The owner role is a row only the owner can create, checked on the server for every `/owner` request.
- Feedback inserts: per-IP and per-browser-id rate limits, a honeypot field, a maximum length, markup stripped on write and escaped on read, a daily cap; a hide status so a flood can be hidden in one action; no captcha at launch (A6).
- Sign-in: magic links expire quickly and are single use; OAuth redirect URLs are fixed to the production and preview origins; no passwords exist.
- A published list of subprocessors on the privacy page (hosting, database, mail, analytics).
- Roadmap votes: unique per account and item enforced in the database; public views expose counts only.
