import type { Chapter } from "../types";

export const archMock: Chapter = {
  id: "arch-mock",
  num: "I10",
  title: "The mock interview engine",
  short: "Mock interviews",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "A loop planner, a pure session reducer and a hiring committee, all in the browser.",
  body: `<h3>The pieces</h3>
<p>
  <code>/mock</code> runs a whole interview loop: a recruiter screen, coding graded by real tests,
  the technical deep dives, system design, behaviour and the offer conversation. The logic is in
  twelve modules under <code>lib/mock</code>, and none of them import React. The UI in
  <code>app/mock</code> is a lobby, a room, a debrief and a readiness dashboard. The engine is pure
  functions over plain data, so the 66 test cases in the four <code>tests/mock*.test.ts</code>
  files can drive a whole loop without rendering anything.
</p>

<figure>
<svg viewBox="0 0 900 300" class="dg" role="img" aria-label="The question bank is built on the server into twelve static JSON responses, one per stage. The browser fetches only the stages in the plan, builds a seeded session, and steps it through a reducer. The finished session is judged by the committee logic, filed into history in localStorage, and read back by the readiness dashboard.">
<g class="rough">
<rect x="24" y="44" width="190" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="250" y="44" width="190" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="476" y="44" width="190" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="702" y="44" width="174" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="702" y="200" width="174" height="72" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="476" y="200" width="190" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="250" y="200" width="190" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="24" y="200" width="190" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<path class="ln" d="M214 80 H244" marker-end="url(#arrow)" />
<path class="ln" d="M440 80 H470" marker-end="url(#arrow)" />
<path class="ln" d="M666 80 H696" marker-end="url(#arrow)" />
<path class="ln" d="M789 116 V194" marker-end="url(#arrow)" />
<path class="ln" d="M702 236 H672" marker-end="url(#arrow)" />
<path class="ln" d="M476 236 H446" marker-end="url(#arrow)" />
<path class="ln" d="M250 236 H220" marker-end="url(#arrow)" />
</g>
<text class="sm" x="24" y="28">SERVER, AT BUILD TIME</text>
<text class="sm" x="476" y="28">BROWSER</text>
<text class="lbl" x="119" y="74" text-anchor="middle">lib/mock/bank.ts</text>
<text class="sm" x="119" y="98" text-anchor="middle">every question</text>
<text class="lbl" x="345" y="74" text-anchor="middle">/mock/bank/[stage]</text>
<text class="sm" x="345" y="98" text-anchor="middle">12 static JSON files</text>
<text class="lbl" x="571" y="74" text-anchor="middle">fetchStage</text>
<text class="sm" x="571" y="98" text-anchor="middle">only planned stages</text>
<text class="lbl" x="789" y="74" text-anchor="middle">buildSession</text>
<text class="sm" x="789" y="98" text-anchor="middle">seeded picks</text>
<text class="lbl gr" x="789" y="230" text-anchor="middle">reduce()</text>
<text class="sm" x="789" y="254" text-anchor="middle">brief, answer, review</text>
<text class="lbl" x="571" y="230" text-anchor="middle">decideLoop</text>
<text class="sm" x="571" y="254" text-anchor="middle">the committee</text>
<text class="lbl" x="345" y="230" text-anchor="middle">history</text>
<text class="sm" x="345" y="254" text-anchor="middle">localStorage, last 50</text>
<text class="lbl" x="119" y="230" text-anchor="middle">readiness</text>
<text class="sm" x="119" y="254" text-anchor="middle">14-day half-life</text>
</svg>
<figcaption>
  The server's only job is to split the question bank by stage. Everything after that, from the
  plan to the verdict, runs in the reader's browser.
</figcaption>
</figure>

<h3>The bank stays on the server</h3>
<p>
  <code>lib/mock/bank.ts</code> assembles the questions. For talk rounds it reads the interview
  rounds in <code>content/interview-data.ts</code> and the JavaScript and React question banks, and
  it parses each answer's seniority ladder out of its HTML. For coding rounds it wraps the site's
  exercises, with function exercises for the coding stage and component exercises for machine
  coding. That is a lot of content, and the lobby needs almost none of it.
</p>
<p>
  So only two app files import the bank's functions. <code>app/mock/page.tsx</code> is a server
  component that calls <code>mockCatalog()</code> and passes the lobby a summary with titles, who
  runs each stage, and a count of questions. <code>app/mock/bank/[stage]/route.ts</code> is a
  route handler with <code>dynamic = "force-static"</code>, <code>dynamicParams = false</code> and
  <code>generateStaticParams</code> over the 12 stages, so the build writes one JSON file per stage
  and any other stage name is a 404. The client files import only types from the bank. There is no
  <code>server-only</code> guard package; the import graph is what keeps the bank off the client.
</p>
<p>
  On the client, <code>fetchStage</code> keeps one promise per stage and forgets it if the fetch
  fails, so a retry works. The lobby starts fetching the plan's stages when the reader hovers or
  focuses Start, and loads the room's code in idle time. The commit that set this up measured the
  lobby going from 628 KB of script and 462 KB of question fetches to 237 KB and 12 KB.
</p>

<h3>Planning a loop</h3>
<p>
  A loop is configured by role (frontend, full-stack, backend), seniority (junior, mid, senior),
  company type (service, product, SaaS, agency) and intensity (quick, standard, full).
  <code>planLoop</code> walks the 12 stages in order and applies each stage's rule from
  <code>STAGE_RULES</code>: which roles and seniorities it applies to, a weight (essential,
  standard or full) compared against the intensity, and whether that kind of company actually runs
  the round. A plan with no coding round gets one inserted.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Intensity</th><th>Talk questions per stage</th><th>Coding problems per stage</th></tr></thead>
<tbody>
<tr><td>Quick</td><td>2</td><td>1</td></tr>
<tr><td>Standard</td><td>3</td><td>2</td></tr>
<tr><td>Full</td><td>4</td><td>2</td></tr>
</tbody>
</table></div>
<p>
  Machine coding gets one problem, or two on a full loop. Time slots are 3, 4 or 5 minutes per
  spoken answer by seniority, 15 minutes per coding function and 20 per component.
</p>
<p>
  <code>lib/mock/styles.ts</code> adds four company styles on top: Amazon-style, big tech, product
  startup and service company. A style can force stages in or out, add questions to a stage, mark
  stages as core, prefer certain source rounds, ask for harder coding, and name stages where a
  lean-no is a veto. Amazon-style, for example, forces a behavioural stage, adds two questions to
  it, prefers the Leadership Principles round, and puts it under a veto.
</p>

<h3>Building a session</h3>
<p>
  <code>buildSession</code> takes the plan, the fetched banks and a seed. The random source is a
  32-bit xorshift, so one seed always gives the same loop, which is what makes the tests
  deterministic. <code>pickItems</code> shuffles each pool and ranks items by fit. A talk question
  scores higher when its level matches the reader's seniority or when the style prefers its source,
  and is dropped when it is marked only for other seniorities or companies. A coding problem scores
  on level and on topic: JavaScript and React for a frontend loop, data structures otherwise. No question is asked twice in a
  loop. Each talk question that has follow-ups gets one, drawn at random from its list.
</p>

<h3>The reducer</h3>
<p>
  A session moves through four steps per question: <code>brief</code> (the stage introduction),
  <code>answer</code>, <code>followup</code> and <code>review</code>. <code>reduce(session,
  action)</code> handles twelve action types, and every case checks the step first, so a stray
  click in the wrong step is ignored. <code>MockApp</code> keeps the session in React state,
  dispatches into this pure function, and writes the session to
  <code>groundwork:mock:current</code> 250 ms after each change. A reload offers to resume, and
  resuming restarts the clock on the current question.
</p>

<h3>The adaptive interviewer</h3>
<p>
  While building, every question after the first in a stage gets two alternates: one harder and
  one easier, chosen from the same pool and reserved so nothing else takes them. When the reader
  moves on, <code>shiftFor</code> reads the score just earned. At 0.8 or above the next question is
  swapped for the harder alternate, and below 0.45 for the easier one. It only happens within a
  stage, and never in a retry round.
</p>
<p>
  <code>persona.ts</code> gives each of the 12 stages an interviewer with a name, a role and a tone
  (warm, sharp or calm). Each tone has three opening lines and its own way of saying the next
  question is harder or more basic. An Amazon-style loop replaces the behavioural interviewer with
  a Bar Raiser.
</p>

<h3>Scoring</h3>
<p>
  Coding is scored by the tests: the fraction passing, minus 0.05 per hint up to 0.15, and capped
  at 0.3 if the reader opened the solution. Spoken answers are scored by the reader against a
  rubric built for that question, each criterion marked 0, a half or 1.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Criterion</th><th>Weight</th><th>Included when</th></tr></thead>
<tbody>
<tr><td>Answered what they were really testing</td><td>2</td><td>The question says what it tests</td></tr>
<tr><td>Had the substance of the model answer</td><td>3</td><td>Always</td></tr>
<tr><td>Stayed clear of the trap</td><td>2</td><td>The question names a trap</td></tr>
<tr><td>Held up when pushed</td><td>2</td><td>A follow-up was asked</td></tr>
<tr><td>Structured and concise</td><td>1</td><td>Always</td></tr>
</tbody>
</table></div>
<p>
  A score maps to a verdict: strong hire from 0.8, hire from 0.65, lean no from 0.45, and no hire
  below that. <code>decideLoop</code> then acts as the hiring committee. It weights core stages
  twice as heavily as the others, then applies its rules in order:
</p>
<ul>
<li>A lean-no in a stage the style vetoes is a <strong>no hire</strong>. This is the Bar Raiser
rule.</li>
<li>A no-hire in any core stage is a no hire, whatever the average says.</li>
<li>Two or more lean-nos anywhere make a lean no.</li>
<li>Otherwise the weighted average decides.</li>
</ul>
<p>
  A hire can still come with a level call. Above junior, a design round under 0.65 turns the offer
  into one at the level below. Every round at strong hire, plus a design score of at least 0.8
  above junior, makes the case for the level above.
</p>

<h3>Pacing</h3>
<p>
  <code>pacing.ts</code> reads the timestamps. A spoken answer is marked rushed if it took less
  than 45 seconds or a fifth of its slot, whichever is shorter. Two or more rushed answers earn a
  note in the debrief, and so does any answer that ran past the clock. The debrief can also be
  copied as plain text with the verdict, each round, the reasons, the pacing and the five weakest
  questions.
</p>

<h3>The design-round whiteboard</h3>
<p>
  The system design stage has a small whiteboard of its own in <code>app/mock/Whiteboard.tsx</code>,
  not the full board from <code>/whiteboard</code>. Its model in <code>lib/mock/board.ts</code> has
  four shape kinds (box, database, queue, text), six stencils (client, load balancer, service,
  database, cache, queue), arrows between shape ids, and a fixed 800 &times; 420 canvas that shapes
  are clamped inside. The board is stored on the question itself through a <code>board</code>
  action, so it is saved and resumed with the session.
</p>

<h3>Storage and readiness</h3>
<p>
  When a session finishes, <code>mockStore.finish</code> runs the committee once more and appends
  a summary to <code>groundwork:mock:history</code>, which keeps the last 50. Questions scoring
  under 0.6 join a retry queue at <code>groundwork:mock:retry</code>, which holds up to 60, and
  questions scoring 0.8 or more leave it. The store exposes <code>subscribe</code> and a cached
  snapshot for <code>useSyncExternalStore</code>, with an empty snapshot on the server.
</p>
<p>
  The readiness dashboard is computed from that history. Each competency's score is an average in
  which a session's weight halves every 14 days, so a session four weeks old counts a quarter as
  much as one from today. The overall score falls in one of four bands (not yet, getting there, interview-ready,
  strong) at the same cut-offs as the verdicts. The dashboard also draws trends, a heatmap of the
  last 10 sessions, and a streak, and suggests what to do next: the weakest competency's weakest
  stage, or a coding or design round never tried.
</p>

<div class="bx is-ref">
<span class="ttl">Why the reader marks their own answers</span>
<p>
  Nothing here sends an answer to a model or a server. The rubric puts the model answer, what the
  question tests and the trap next to the reader's notes, and asks for an honest mark. That keeps
  the feature free and private and makes it work offline. The cost is that the score is only as
  honest as the person marking.
</p>
</div>`,
};
