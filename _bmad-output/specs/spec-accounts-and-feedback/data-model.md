# Data model, sync and feedback

Companion to `SPEC.md` (CAP-1 to CAP-8). Proposed shapes, not code; the build entries refine them. One Supabase project in Mumbai or the nearest available region (A4).

## Tables (Supabase, Row Level Security on all)

| Table | Holds | Who reads | Who writes |
|---|---|---|---|
| `profiles` | `user_id`, `display_name`, `experience`, `target_roles[]`, `languages[]`, `topics[]`, `country`, `consents` (one boolean and timestamp per field), `created_at` | the reader | the reader |
| `progress_sync` | `user_id`, `key`, `value` (JSON), `updated_at`, `device_id` | the reader | the reader |
| `feedback` | `id`, `anon_id` or `user_id`, `kind` (`vote`, `wrong-answer`, `general`, `feature`), `page`, `chapter_id`, `question_id`, `vote` (`helpful` or `unclear`), `comment` (max 1,000 characters), `reply_requested`, `email` (only when `reply_requested`), `public_ok` (default false), `approved_at` (owner-set, only when `public_ok`), `status` (`new`, `seen`, `answered`, `wontfix`, `hidden`), `tags[]`, `created_at` | the owner; the public sees only comment text of rows with `approved_at` through a view | anyone through the insert route |
| `prompt_state` | `user_id` or `anon_id`, `prompt_kind`, `dismissed_at`, `answered_at` | the reader | the reader |
| `deletion_requests` | `user_id`, `requested_at`, `completed_at` | the owner | the reader |
| `roadmap_items` | `id`, `title`, `summary`, `status` (`planned`, `building`, `shipped`), `created_at` | anyone | the owner |
| `roadmap_votes` | `item_id`, `user_id`, `created_at`; unique (`item_id`, `user_id`) | the reader sees their own rows | the reader, own rows only |
| `roles` | `user_id`, `role` (`owner`) | the server | the owner only, by SQL |

Public vote counts and approved comments come from database views that expose counts and text only, never `user_id`, `anon_id`, `email` or the vote rows; a deleted account's votes are deleted and counts drop. A feedback vote is unique per (`anon_id` or `user_id`, `chapter_id`, `kind`); a second vote replaces the first. `anon_id` is a random id generated in the browser and stored in `groundwork:anon` (a new local key, listed in the architecture chapter); it is never sent with a profile and never linked to an account unless the reader chooses. The submit confirmation returns the feedback `id` as a reference for deletion on request.

## What syncs (phase 2)

| Local key | Sync rule |
|---|---|
| `jsnotes:progress` (chapter marks, exercises) | merge by union; a mark keeps the earliest read time and the highest review count |
| `groundwork:quiz` (check records, missed ids) | merge by union per chapter; keep the best score, the latest attempt, a pass over a miss |
| `groundwork:dsa:placement` | keep the newest by `takenAt` |
| `jsnotes:activity`, streak | union of active days |
| `jsnotes:level`, `jsnotes:theme`, `jsnotes:font`, `jsnotes:zoom`, `groundwork:dsa:lang`, narration and editor settings | last-write-wins by `updated_at` |
| `groundwork:mock:history`, `groundwork:interview:confidence` | merge by union keyed by id and time |
| `jsnotes:code:*`, `groundwork:playground:*`, `groundwork:boards*` | not synced in phase 2 (large, personal drafts); a later phase may offer it |
| `groundwork:nav:*`, `groundwork:problems-url`, `groundwork:mock:current`, `groundwork:mock:retry` | never synced (device state) |

At first sign-in the site shows what it found locally and on the account and merges them with the rules above; nothing is deleted on either side. The client writes a changed key at most every few seconds and when the tab hides; it never blocks the UI; offline writes queue in local storage and send later. The server accepts only rows for the signed-in reader (Row Level Security) and validates the shape and size of each value.

## Feedback surfaces (phase 0, no login)

- A "Helpful / This was unclear" control at the end of a chapter (after the check on a quiz chapter), with an optional comment.
- "Report a problem with this question" on a check and placement question, carrying the question id.
- A general feedback and feature-request form behind a footer link and the menu. Two unticked boxes: "I would like a reply" (reveals the email field) and "You may show my comment publicly, without my name or email, if approved".
- Prompts (CAP-7): after the third finished chapter, after a failed check, and after a first mock interview, and one "how likely are you to recommend this" question (0 to 10, optional comment) after the tenth finished chapter; each kind at most once, dismissible for good, stored in `groundwork:prompts`.
- Writes go through one server route that validates, rate-limits per IP and per `anon_id`, applies a honeypot, strips markup and stores the row; no personal data in the request log. The IP is used only as a salted hash for rate limiting, discarded within 24 hours and never stored on the row; no captcha unless a flood needs one (A6).

## Owner view (phase 3)

A protected `/owner` area (server-checked `owner` role): the feedback inbox with filters by kind, chapter, status and tag; counts of signups and of readers active in the last 7 and 30 days; the most-missed check and placement questions (from the aggregated, anonymised missed ids that signed-in readers choose to share); the chapters with the most "unclear" votes; CSV export; an approve action for comments with `public_ok` and a hide action for a flood. Aggregates are database views, not client code.

## Public roadmap (phase 4)

The owner publishes `roadmap_items`; anyone sees items, vote counts and approved comments; only a signed-in reader votes, once per item, and can withdraw. Display names are never shown with votes.

## Architecture impact

- Auth client and feedback code are dynamically imported on first interaction; a unit test keeps the home and chapter bundles within their current budgets.
- No page becomes dynamic; sign-in state is read client-side; the only new server code is the feedback route, the account export and delete routes, the owner area and the vote route; routes run in the region nearest the database.
- New local keys (`groundwork:anon`, `groundwork:prompts`, and the Supabase session keys) join the "How this is built" key table; the privacy page and its test change in the same story as each collection starts.
- Tests: RLS policy tests against a local Supabase, route tests for validation and rate limits, sync merge unit tests (pure functions), e2e for sign-in with a stubbed provider, the feedback flow, the vote rules (one per account, signed-out cannot vote, no voter identity in any public response), and the guest path proving nothing is gated.
