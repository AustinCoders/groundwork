---
title: 'Remove the CV details and make the privacy copy true'
type: 'bugfix'
ticket: '1'
created: '2026-09-30'
status: 'built'
baseline_revision: '2ebf8ed862ac9fde441e308d9fc7a762b8a08053'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 1
followup_review_recommended: true
context: ['{project-root}/AGENTS.md']
warnings: ['oversized']
deferred:
  - summary: >-
      The architecture overview still says the build makes 1,742 files, in five places including a to-scale bar broken down by route kind. The build and request-path chapters now say 1,762.
    evidence: |-
      .next/prerender-manifest.json lists 1,762 routes (1,177 pages + 571 route handlers + 14 metadata routes). Fixing arch-overview.ts means recomputing its breakdown bar, and tests/claims.test.ts does not assert these figures. This predates the change; the new /privacy page adds one.
    location: >-
      content/architecture/arch-overview.ts
    severity: low
  - summary: >-
      Older commits in git history still contain the removed CV text.
    evidence: |-
      This change removes the details from the working tree and from main from now on. Rewriting history needs a force push, which the repo's rules forbid without the owner's decision.
    location: >-
      git history before this story's commit
    severity: medium
---

<intent-contract>

## Intent

**Problem:** The interview book still names the author's earlier employer, home town and relocation month. They appear in the scouting report's attacks 6 and 8 and in R1's relocation answer. R10 also lists one specific resume's ten metrics and architecture. The committed audit copy repeats the relocation month. Meanwhile the home FAQ says "nothing about you leaves your machine", although page analytics, the weather lookup, the narrator, error reports and runtime downloads all leave the browser, and there is no privacy page.

**Approach:**
- (User decision, 2026-09-30.) Every other passage in the book that states the author's own resume or history also becomes a generic example: education (degree, institution, its town, graduation year), employment start dates, and resume facts (the ten metrics, user and visitor counts, the number of applications and environments, the named platform, services and integrations). Use example numbers that differ from the originals.
- Make those passages generic, and turn R10 into a template for the reader's own resume.
- Remove the two names from the spelling list, and redact the audit copy.
- Rewrite the FAQ's privacy answer.
- Add an indexed `/privacy` page in `PageFrame` that lists exactly what leaves the browser and names each service, as the intent already does for Sentry. Link it from the FAQ and the home footer.

## Boundaries & Constraints

**Always:**
- Never write the removed employer name, the home town, the relocation month, or the new city tied to a relocation into any file, test, commit message, plan note or reply. Find them by line:
  - `content/interview-data.ts:54,66-70,176-180`;
  - `.cspell/project-words.txt:403,454`;
  - the audit's C1 section.
  Check that they are gone with a scratch grep, and record only the counts.
- Keep every round's number of questions unchanged, because `tests/claims.test.ts` asserts the interview-question counts.
- The privacy copy states only what the code does today.
- No comments. Theme tokens only; the new module must pass `tests/theme-roles.test.ts` and `tests/theme-contract.test.ts` with no colour literal.
- Delete lines from `.cspell/project-words.txt`; never re-sort it.

**Never:**
- Do not rewrite interview content beyond the passages that state the author's own resume or history.
- Do not remove the book's author name.
- Do not touch git history. Older commits keep the old text; rewriting history is the user's decision.
- Do not change how analytics, the weather, the narrator or error reporting behave; only describe them.
- Do not add `/privacy` to the sitemap. Entry 5 owns that.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| CV details gone | Scratch grep of `content/`, `lib/`, `app/`, `.cspell/` and `_bmad-output/` for the two spelling-list names and the relocation month | No match; the counts are recorded as zero | No error expected |
| Privacy page | `GET /privacy` | Renders inside `PageFrame` (labelled back button, menu) with an `h1` "Privacy". Its canonical is `/privacy`, and it has no `noindex`. | No error expected |
| FAQ | The home FAQ "Do I need to sign up?" is opened | The answer says what leaves the browser and links to `/privacy` | No error expected |
| Footer | The home footer | Its "You" column has a "Privacy" link to `/privacy` | No error expected |
| Resume facts gone | The whole interview book, the mock stages drawing on it, and the seven-day plan | No page states the author's education, employment dates or resume metrics. Example figures differ from the originals, and cross-references such as "all ten metric questions" match the templates | Scratch grep and a read-through, with counts recorded |
| Mock reuse | The mock loop's resume stage, which draws on R10 through `lib/mock/bank.ts` | Uses the templated R10 questions; the existing mock tests pass | Vitest or e2e failure |

</intent-contract>

## Code Map

- `content/interview-data.ts`, the scouting report (lines 5–114):
  - It keeps its "one example profile" framing.
  - Attack 6 (line 54): the earlier employer becomes "an early role".
  - Attack 8 (lines 66–70):
    - The title becomes "Attack 8 — relocation".
    - The answer says you are listed in `<your home city>` and remote.
    - The resume edit becomes `<your home city>, India · Open to relocation` → `<the job's city>, India`, with no date.
    - The follow-ups use no city name.
  - Line 21: "Prepare all ten. They are listed in R10." becomes: prepare every number on your resume; R10 gives the template.
- `content/interview-data.ts`, R1 (lines 176–180):
  - The question becomes "Are you actually relocating for this role, or are you looking for remote?"
  - The answer and script are written for anyone who has moved or will move, with no city named.
  - The market reference on line 162 is not personal; leave it.
- `content/interview-data.ts`, R10 (lines 3189–3279). There are six questions; keep six.
  - Q1 becomes "Every number on your resume, one at a time". It is a template: for each number, the period, the tool it was measured in, the baseline and the verified change, with two or three placeholder examples, not the ten specific metrics.
  - Q2 becomes "Draw the architecture of one of your applications", with a generic board list: client and how it is served, proxy or load balancer, services and what each owns, datastores, integrations and the direction of calls, environments, where real-time data comes from.
  - Q3, Q4 and Q6 drop the facts from one resume and phrase them as conditions:
    - the Redux story;
    - the resume's user count;
    - the line about missing tests in [the most recent roles];
    - the job-change history, with [its count] and [its durations].
- `lib/mock/bank.ts:38,57,72` -- reuses R10 and R1 by round id. No copy of the text lives here, so confirm the mock tests still pass.
- `.cspell/project-words.txt:403,454` -- delete the two lines.
- `_bmad-output/planning-artifacts/audit-2026-09-28/seo-content-roadmap.md` -- in C1, remove the relocation month from the evidence and from the fix. Keep the bracketed placeholders.
- `app/HomeView.tsx`:
  - Lines 768–771: the "Do I need to sign up?" answer says there is no account and progress, streak and boards stay in this browser. It names what does leave: anonymous page analytics, the weather lookup if you ask for it, the text the narrator reads, and error reports. It then links to `/privacy`.
  - Render the link the way lines 1139–1144 already append one for "How is the site…". A small optional `link` on the FAQ entry is fine.
  - Lines 1204–1209: add `<Link href="/privacy">Privacy</Link>` to the footer's "You" nav.
- `app/privacy/page.tsx` (new):
  - A server page: `pageMetadata({ title: "Privacy", description, path: "/privacy" })` (indexed) and `<PageFrame title="Privacy" skipLabel="Skip to the privacy notes">`.
  - Sections, each true to the code:
    1. **No account.** The site sets no cookies of its own (none in the code).
    2. **What stays in this browser.** Progress, streak, marks, boards, code drafts and settings, in `localStorage` (`lib/storage.ts` `KEYS`). Clearing site data removes them.
    3. **What leaves it:**
       - Vercel Web Analytics and Speed Insights: anonymous page views and performance metrics, with no cookies (`app/layout.tsx:58-59`).
       - The weather, only when you press the clock's weather button. The browser sends its coordinates to `/api/weather`, which rounds them to one decimal place before asking Open-Meteo (`app/api/weather/route.ts:48-51`). The result is cached in the browser.
       - The narrator. The paragraph being read is sent to `/api/tts`, which asks Microsoft's Edge read-aloud service for the audio (`app/api/tts/route.ts`).
       - Error reports: message, stack, page URL and user agent go to `/api/client-error` and into the host's logs (`app/api/client-error/route.ts`), and to Sentry once error tracking is switched on (`instrumentation-client.ts`).
       - Language runtimes: the playground downloads Pyodide, sql.js and other runtimes from jsDelivr when you run those languages (`lib/wasmAssets.ts`). Your code runs in the browser.
       - Hosting: Vercel serves every page and keeps standard request logs.
    4. **What never leaves.** Your code and answers. Share links carry the board or code after `#`, which browsers do not send to a server (`lib/shareLink.ts`).
    5. A "Last updated 30 September 2026" line.
- `app/privacy/privacy.module.css` (new) -- readable prose styles with theme tokens only; links in `--primary` and underlined.
- `e2e/smoke.spec.ts` -- a test covering matrix rows 2–4:
  - On `/privacy`: `header a.head-back` is visible, the `h1` is "Privacy", `link[rel=canonical]` ends with `/privacy`, and there is no `noindex` robots meta.
  - On `/`: open the FAQ item, then check its `/privacy` link and the footer's "Privacy" link.
- `e2e/a11y.spec.ts:4-24` -- add `/privacy` to `PAGES`. Then update the counts the claims test asserts: the axe pages and tests in `content/architecture/arch-design-system.ts` and `arch-testing.ts`.
- `docs/roadmap.html` -- set `t45` and `t46` to done, `doneOn` "2026-09-30", with a one-line note each, and run prettier. The coordinator republishes the roadmap artifact.

## Tasks & Acceptance

**Execution:**
- [x] `content/interview-data.ts` -- the scouting report, R1 and R10 made generic, with question counts unchanged -- nothing identifies the author's history
- [x] `.cspell/project-words.txt`, `_bmad-output/planning-artifacts/audit-2026-09-28/seo-content-roadmap.md` -- the two names deleted and the relocation month redacted -- the repo no longer repeats them
- [x] `app/HomeView.tsx` -- the FAQ answer made true and linked, and the footer link -- the claim matches the code
- [x] `app/privacy/page.tsx`, `app/privacy/privacy.module.css` -- the privacy page -- a true, linkable account of what leaves the browser
- [x] `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `content/architecture/arch-design-system.ts`, `content/architecture/arch-testing.ts` -- the surface tests, `/privacy` under axe, and the counts -- matrix rows 2–4
- [x] `docs/roadmap.html` -- tick `t45` and `t46` -- the roadmap reflects the story
- [ ] Scratch grep -- the removed names and month are gone from `content/`, `lib/`, `app/`, `.cspell/` and `_bmad-output/`, counts recorded -- matrix row 1

**Acceptance Criteria:**
- Given the site built from this branch, when someone reads the interview book (the scouting report, R1 and R10) and the mock loop's resume stage, then no page names the author's employer history, home town or relocation, and R10 reads as a template for the reader's own resume.
- Given `npm run check`, `npm run build` and `npm run test:e2e`, when they run, then all pass, and axe passes on `/privacy`.

## Implementation Notes

- R10 Q1's old title was a bulk heading, matched by a regex copied into `lib/interviewContent.ts`, `lib/interviewBook.ts` and `lib/mock/bank.ts`. All three now call one predicate, `isBulkTitle` in `lib/interviewBulk.ts`, which matches "every number on your resume", so the templated Q1 stays a bulk heading. `tests/mock-engine.test.ts` checks that the mock never draws, and the question bank never lists, a question the book marks bulk.
- To keep R10's counted questions unchanged (26, and the book's 420), Q1 still holds ten `<li>` items: ten follow-ups distinct from the template's four facts. The template itself is a paragraph (period, tool, baseline, verified change) and a three-row placeholder table.
- R10 Q2's follow-up now asks about "the cache" rather than a named store, and Q4's title is a condition: "If you have written standards for a team…".
- Review round (user widened the intent): the book's example profile now has its own figures throughout, different from the originals (application, environment and service counts, the ten metrics, user and visitor counts, the infrastructure saving, the deploy time, the cloud list), and a generic booking platform in place of the named one. Education and the employment start are placeholders; resume-tied `test` lines and question titles are phrased as conditions; the seven-day plan points at the R10 template and R1's walkthrough; R12 no longer ties the job's city to a move; R13 no longer states years of remote work. Three more names left the spelling list with the text that used them (two client names and the institution's town).
- Kept on purpose: "six years" as the book's level anchor, the stack (Next.js, NestJS, Redis, AWS), the market references to the city that do not imply a move, and R8's real-time dashboard question as a design question (its `test` line no longer ties it to a resume).
- Relocation: Attack 8 and R1 add "When do you move, and is the date fixed?"; R1's `say` holds both scripts, moved and not yet moved.
- Scratch grep, after this round: 53 old phrases and figures (read from `git show 2ebf8ed:content/interview-data.ts` into variables, plus the five spelling-list words and the month) checked against the book: 52 at 0 matches, 1 at 1 match (the R8 design-question title above). The five words and the month: 0 matches across `content/ lib/ app/ .cspell/ _bmad-output/`.
- Second review round: this plan's R10 bullet and the audit's C1 evidence now use role descriptions and bracketed placeholders. The book's remaining resume-as-fact lines are conditions, and the mock asks the conditional titles through `AS_ASKED` wordings with a fallback (r4-4, r4-13, r5-2, r9-1, r10-3). The example profile's deploy time, environments, years and dive-deep story now agree, and R10 points at R4.14. The privacy page states what analytics receives, what Sentry's breadcrumbs can carry, how long the weather answer stays, when a share link's `#` part can still leave, and who runs the site, with the contact address the user gave. `tests/privacy.test.ts` compares exact hosts from http, https and wss URLs across `app/`, `components/`, `lib/` and the root source files. `tests/claims.test.ts` derives the smoke and three-spec browser totals.
- Scratch grep, second round: 61 old phrases and figures (the 53 above plus eight more from R10, the staff track and R3, read the same way) against the Implementation Notes: 0 matches; the roadmap's t45, t46 and t53: 0; the audit copy: 0; the whole plan file: 1 (the matrix row in the intent contract quotes the old seven-day-plan cross-reference); the book: 1 (the R8 design-question title kept above).
- The audit also repeated the relocation month in Part A's t01 row, outside C1; both places now read "[month]".
- The FAQ's existing "How is the site" link moved onto the same optional `link` field as the new privacy link.
- The privacy page also names JokeAPI (the progress page's joke, fetched server side). It says the browser sends exact coordinates to `/api/weather` (so they can reach the host's logs) and only the server rounds them; that the narrator's voice, speed and pitch go with each `/api/tts` request; that Sentry, once on, also gets timing traces for about one page load in ten; and that the page strips a share link's `#` part as soon as it has read it. `tests/privacy.test.ts` fails if the page stops naming a service the code reaches, or if the code calls an outside host with no row in its table.
- Scratch grep of `content/ lib/ app/ .cspell/ _bmad-output/` after the edits: the two spelling-list words 0 and 0 matches, the relocation month 0 matches (also 0 across the whole repo outside `node_modules`, `.next` and `.git`).

## Plan Change Log

- 2026-09-30, human renegotiation. Review found more of the author's CV outside the passages the plan scoped:
  - R1's "rest of the screening call" gives education and employment dates;
  - the scouting report and R1 answers keep the resume's metrics;
  - the same facts repeat through the book and the seven-day plan.
  
  The user chose "make everything generic". Amended: the Approach gains a line, Never is narrowed to "beyond the passages that state the author's own resume or history", and the matrix gains a "Resume facts gone" row.
  
  KEEP: the scouting, R1 and R10 changes already made; the privacy page and its tests; the single-constant approach for the bulk title (see review).

## Review Triage Log

### 2026-09-30 — Review pass 1
- verdicts: 28 findings — high 1, medium 11, low 15, false 1, maybe-false 0
- findings:
  - `[medium]` `[patch]` VG1 (pre-verified): the bulk-title regex is copied in three files with no test. Reverting two copies still passed all 283 tests. Action: one shared constant, and mock-engine assertions that no book-drawn talk item or bank question is bulk.
  - `[low]` `[patch]` VG2 (pre-verified): the FAQ's architecture link moved into data untested. Action: the privacy smoke test also checks that link.
  - `[medium]` `[patch]` VG other: with a DSN set, Sentry also receives sampled performance traces (`tracesSampleRate: 0.1`). Verified in `lib/errorTracking.ts`. Action: the privacy page says so.
  - `[low]` `[patch]` VG other: the `arch-testing.ts` smoke row was stale, and the change adds a test. Action: recounted and updated.
  - `[low]` `[reject]` VG other: the "Last updated" date names a month. It is the page's own date, not the relocation month, and the rule protects the relocation phrase.
  - `[low]` `[reject]` BH: the recorded grep result claims too much for the month name. The fix would edit this plan's notes. The grep targeted the relocation phrase, which the rule protects, and it holds at zero.
  - `[low]` `[patch]` BH: the new city is not checked, and R12 ties the city to a move. Action: under the widened intent, R12's worked example no longer ties the city to a move. Market references stay by decision.
  - `[medium]` `[patch]` BH: the scouting report and the rest of the book still carry the resume taken out of R10. Verified at the cited lines. Taken to the user, who chose "make everything generic", recorded in the Plan Change Log. Action: a generic example profile throughout.
  - `[low]` `[patch]` BH: stale cross-references in the seven-day plan (Day 1's "all ten", Day 3's defence). Action: updated to match the R10 template.
  - `[medium]` `[patch]` BH: the privacy page says the narrator's voice is not sent. Verified: `narration.ts` sends voice, rate and pitch to `/api/tts`. Action: stated plainly.
  - `[medium]` `[patch]` BH: the weather bullet implies rounding protects your location. Verified: the browser sends full-precision coordinates, and only the server rounds them. Action: stated plainly; client-side rounding would change behaviour and is out of scope.
  - `[medium]` `[patch]` BH: Sentry traces. Grouped with the VG other row.
  - `[low]` `[patch]` BH: the share-link exception is overstated. Verified: the fragment is removed right after it is read. Action: the sentence is precise.
  - `[low]` `[patch]` BH: the FAQ list reads as complete. Action: the runtime downloads and host logs are added, or the list is marked as examples.
  - `[low]` `[patch]` BH: `/privacy` can be reached only from home. Action: a Privacy link in the drawer's foot note.
  - `[low]` `[patch]` BH: stale stated counts and routes: the smoke row, the build's page count, and `/privacy` missing from `arch-routes`. Action: recounted and updated.
  - `[low]` `[patch]` BH: R10 Q1 repeats itself to keep a count. Action: ten distinct questions, with the count unchanged.
  - `[medium]` `[patch]` BH: the triple bulk regex. Grouped with VG1.
  - `[low]` `[patch]` BH: the relocation follow-ups assume the move has happened. Action: a not-yet-moved follow-up, and a `say` block for the moving-date line.
  - `[low]` `[patch]` BH: nothing ties the privacy page to the code. Action: a table-driven test that each upstream found in the code is named on `/privacy`. Contact details and retention periods were not added, because they are facts this change cannot verify.
  - `[false]` `[reject]` BH: the plan's bookkeeping is behind. The reviewer read it mid-workflow; the status is set at review and finalize.
  - `[medium]` `[patch]` EC: weather coordinates. Grouped with the BH weather row.
  - `[low]` `[patch]` EC: R10 Q4's title asserts a resume line to every mock user. Action: phrased as a condition.
  - `[low]` `[patch]` EC: the `arch-testing` count. Grouped with the VG other row.
  - `[medium]` `[patch]` EC: the narrator's voice settings. Grouped with the BH settings row.
  - `[medium]` `[patch]` EC: Sentry traces. Grouped with the VG other row.
  - `[medium]` `[patch]` EC: the scouting metrics. Grouped with the BH persona row.
  - `[high]` `[patch]` Intent auditor. Two findings, both verified:
    - R1's "rest of the screening call" still states education and employment dates. Taken to the user, whose decision widened the intent.
    - The home card near line 962 still says nothing leaves your machine.
    
    Action: both made generic or true. The FAQ's category-level wording, the vendor naming and the sitemap left to entry 5 match readings C1 and D.

### 2026-09-30 — Review pass 2 (after the user widened the intent)
- verdicts: 35 findings — high 2, medium 8, low 24, false 1, maybe-false 0
- findings:
  - `[high]` `[patch]` Intent auditor. Verified in two places:
    - The committed plan and the audit copy still quote original resume facts.
    - The rest of the divergences map to the rows below.
    
    Action: both files now use role descriptions or placeholders. Its remaining divergences (telemetry scope, the untested counts, the mock wording) are the rows below.
  - `[medium]` `[patch]` VG1 (pre-verified): the bulk test takes its expected set from the book's own flag, so two mutations pass. Action: assert no bank entry satisfies `isBulkTitle`, R10 Q1 is bulk, and the book's count adds up to `INTERVIEW_TOTAL_QUESTIONS`.
  - `[low]` `[patch]` VG2 (pre-verified): the menu's and home card's Privacy links are untested. Action: e2e assertions for both.
  - `[low]` `[patch]` VG3 (pre-verified): the browser-test counts are hand-kept. Action: the claims test derives the smoke count and the three-spec total. The build's page count stays hand-kept, because deriving it needs a build.
  - `[low]` `[patch]` VG other: `privacy.test.ts` is narrower than the t46 note claims. Grouped with EC7.
  - `[high]` `[patch]` BH: committed files quote resume facts. Grouped with the auditor row.
  - `[medium]` `[patch]` BH: the book tells every reader they built the site's own platform, with its old counts. Action: "a public project of your own", with placeholders.
  - `[medium]` `[patch]` BH: a leftover line keeps the original platform's domain as the reader's. Action: moved onto the clinic example.
  - `[medium]` `[patch]` BH: several resume claims have no "if". Action: phrased as conditions.
  - `[medium]` `[patch]` BH: the mock reads the new "If you have…" titles aloud. Action: `AS_ASKED` wordings with a fallback clause.
  - `[low]` `[patch]` BH: the example's deploy time disagrees between R9 and the STAR story. Action: made consistent.
  - `[low]` `[patch]` BH: R9's cost bullet miscounts the non-production environments. Action: fixed.
  - `[low]` `[patch]` BH: the example's years of experience disagree. Action: made consistent.
  - `[low]` `[patch]` BH: telemetry could read the share fragment before it is cleared. Whether Vercel's scripts keep the hash is unverified, so the page sentence is made non-absolute rather than making a claim either way.
  - `[low]` `[patch]` BH: `privacy.test.ts` scans too little. Grouped with EC7.
  - `[low]` `[patch]` BH: hand-kept counts in `arch-testing.ts`. Grouped with VG3.
  - `[low]` `[patch]` BH: nothing records that the sitemap deferral includes `/privacy`. Action: added to t53's "why".
  - `[low]` `[reject]` BH: no contact route. The code has no public contact or repository link, so adding one is the owner's decision; it is flagged to the user.
  - `[low]` `[patch]` BH: the new Privacy links are untested. Grouped with VG2.
  - `[low]` `[patch]` BH: the employment-gaps template assumes no gap. Action: both shapes given.
  - `[low]` `[patch]` BH: Attack 8's note makes an unsourced claim. Action: softened.
  - `[false]` `[reject]` BH: the plan's checkboxes are unticked. The reviewer read it mid-workflow; they are ticked at finalize.
  - `[medium]` `[patch]` EC: with a DSN set, Sentry's default breadcrumbs can carry fetch and navigation URLs, including the exact weather coordinates. Verified from the SDK defaults. Action: stated on the page; scrubbing would change behaviour, which is out of scope.
  - `[low]` `[patch]` EC: `arch-request-path` prose says 1,742 against its table's 1,762. Action: updated.
  - `[low]` `[patch]` EC: `arch-build`'s title says 1,742 files. Action: 1,762.
  - `[low]` `[patch]` EC: the `arch-testing` subtitle says 74 against the heading's 96. Action: updated.
  - `[low]` `[patch]` EC: the `mock-engine` test count is stale. Action: updated from the vitest output.
  - `[low]` `[patch]` EC: the unit inventory leaves out `privacy.test.ts`. Action: added and recounted.
  - `[low]` `[patch]` EC: root files, `http://` and `wss://` are not scanned. Action: added. Env-built origins are still out of reach and are noted in the t46 wording.
  - `[low]` `[patch]` EC: hosts are matched by substring. Action: exact-host matching.
  - `[low]` `[patch]` EC: the weather result stays in the browser past half an hour. Action: the page says it stays until the next lookup.
  - `[low]` `[patch]` EC: R10 Q1 points to R4.13. Action: R4.14.
  - `[low]` `[patch]` EC: the dive-deep story blames a queue the profile does not have. Action: blames a delay the profile does have.
  - `[medium]` `[patch]` EC: the Sentry breadcrumbs claim. Grouped with the EC Sentry row.

## Design Notes

The privacy page names each service because the ticket already names Sentry, and the epic orders entry 7 after this one because "the privacy page names Sentry". It describes the code as it is today. When entry 7 switches Sentry on, the error-reports line is already true.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass (spell included, with the two words gone).
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass. e2e serves on 3100; never touch 3000.

**Manual checks (if no CLI):**
- Read the words at `.cspell/project-words.txt:403,454` into shell variables before deleting them. After the edits, grep `content/ lib/ app/ .cspell/ _bmad-output/` for each variable and for the relocation month, and record only the match counts.

## Auto Run Result

- **Summary:** nothing on the site or in the repo's working files states the author's CV any more.
  - The interview book follows one generic example profile, with figures different from the originals. That covers the scouting report, R1 through R14 wherever they repeated resume facts, and the seven-day plan.
  - R10 is a template for the reader's own resume, and relocation reads for readers who have moved and those who have not.
  - The five spelling-list words are deleted, and the audit copy and this plan use placeholders.
  - The home FAQ and the "Nothing to sign up for" card are true, and link a new indexed `/privacy` page in `PageFrame`. That page names every service that receives data, how, and who to write to (`help@austincoders.com`, at the user's request).
  - The page is linked from the FAQ, the card, the home footer and the site menu.
  - The user widened the intent mid-review to "make everything generic", recorded in the Plan Change Log.
- **Files changed:**
  - `content/interview-data.ts`: the generic profile, the R10 template and the relocation shapes.
  - `lib/interviewBulk.ts` (new): one bulk-title predicate, used by `lib/interviewContent.ts`, `lib/interviewBook.ts` and `lib/mock/bank.ts`, plus `AS_ASKED` fallbacks for the conditional titles.
  - `.cspell/project-words.txt`: five words removed, two appended.
  - `app/HomeView.tsx`: the FAQ, the card and the footer link.
  - `components/SiteDrawer.tsx`: a Privacy link in the menu.
  - `app/privacy/page.tsx` and `privacy.module.css` (new).
  - `tests/privacy.test.ts` (new): every outside host in the code maps to a named service, and the contact line stays.
  - `tests/mock-engine.test.ts`: the bulk and count checks.
  - `tests/claims.test.ts`: the smoke and browser-test counts are derived.
  - `e2e/smoke.spec.ts` and `e2e/a11y.spec.ts`: `/privacy` render, links and axe.
  - `content/architecture/*` and `content/topics.ts`: the recounted figures.
  - `_bmad-output/planning-artifacts/audit-2026-09-28/seo-content-roadmap.md`: redacted.
  - `docs/roadmap.html`: t45 and t46 done, and `/privacy` added to t53.
- **Review findings:** two passes, 28 + 35 findings.
  - Pass 1 patched high 1, medium 11 and low 13, and rejected 3.
  - Pass 2 patched high 2, medium 8 and low 23, and rejected 2.
  - Rejected, with reasons in the triage log:
    - the calendar date on the page (it is not the relocation month);
    - the grep-note wording (a fix would edit this plan);
    - the plan's bookkeeping, twice (the reviewers read it mid-workflow);
    - the contact route in pass 2 (the user later chose `help@austincoders.com`, and it was added).
  - 2 deferred: the stale 1,742 in `arch-overview.ts`, and the old text in git history (the owner's decision).
- **Follow-up review:** recommended. Pass 2 patched two high entries without a third lens run. The unverified risks:
  - the prose quality of the many rewritten book passages;
  - whether the remaining example figures could still hint at the original profile. They were checked by grep counts against 61 old phrases, all zero apart from one design-question title kept on purpose.
- **Verification:**
  - `npm run check`: 298 unit tests, cspell 0 issues.
  - `npm run build`.
  - `npm run test:e2e`: 96 passed, axe on `/privacy` included.
  - Scratch greps, counts only: 0 matches for the five removed words and the relocation phrase across `content/ lib/ app/ components/ .cspell/ _bmad-output/ docs/`.
- **Residual risks:**
  - Git history keeps the old text.
  - `/privacy` is not in the sitemap until entry 5.
  - The Sentry sentences become live when entry 7 sets the DSN.
