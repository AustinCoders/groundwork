// AUTO-EXTRACTED from the original interview.html round data.
// Field names match the source 1:1 (q/test/a/say/trap/note/after/fu/code, r.meta/tiers/intro/pre/qs).
// Rendering into site-consistent markup happens in lib/interviewRender.ts.
import type { InterviewRoundRaw } from "./interview-types";

export const INTERVIEW_ROUNDS_RAW: InterviewRoundRaw[] = [
{
id:'scout', code:'00', navTitle:'Scouting report',
title:'The scouting report',
meta:[['Written by','The interviewer, not you'],['Read it','Before anything else'],['Purpose','Know your resume better than they do']],
tiers:[['read this first',1]],
intro:'This is how your resume reads from the other side of the table, in the ninety seconds before your name gets called. Every one of the eight attacks below will surface somewhere across your loop, and each has a good answer — if you prepare it now instead of inventing it in the room.',
pre:`<div class="cards">
<div class="card g"><h4>You own things end to end</h4><p>"Technical owner of 4 client applications in production" is the line that gets you the interview. Most six-year candidates have owned features; you have owned releases. Lead with it.</p></div>
<div class="card g"><h4>Your stack is the hiring sweet spot</h4><p>TypeScript on both ends, Next.js App Router, NestJS, Redis, Docker, GitHub Actions — in production, not in tutorials. That combination is in demand right now.</p></div>
<div class="card g"><h4>Every bullet has a number</h4><p>Reads as an engineer who measures. It also creates attack 1 below.</p></div>
<div class="card g"><h4>You have set standards for others</h4><p>Authoring the frontend and API standards, code review, mentoring. That is the difference between senior as a title and senior as a behaviour.</p></div>
</div>`,
qs:[
{
q:'Attack 1 — the metrics',
test:'Whether the numbers are measurements or decoration.',
a:`<p>Forty percent fewer runtime errors. Thirty-five percent faster pages. Twenty-five percent infra saving. I will pick one at random and ask exactly how you measured it, over what window, and against what baseline. If you cannot answer that, every other number on the page turns from a fact into a claim — including the ones you <em>can</em> defend.</p>
<p><b>Prepare all ten.</b> They are listed in R10.</p>`
},
{
q:'Attack 2 — scale',
test:'Whether you can reason about load you have not personally carried.',
a:`<p>Five thousand registered users and ten thousand monthly visitors is a small system. If I am hiring for traffic, I want to know whether you can think about ten times or a hundred times that.</p>
<p>The answer is not to inflate it. It is to be precise about what you <em>have</em> done — depth on delivery, reliability and architecture ownership — and then demonstrate in R8 that you can reason about scale you have not met. Those are different skills and interviewers know it.</p>`
},
{
q:'Attack 3 — no async layer',
test:'Whether six services with no messaging is a decision or a gap.',
a:`<p>No message queue, no background job system, no event bus anywhere on the page. Six NestJS services communicating with no async messaging means either tight HTTP coupling or something missing from the story.</p>
<p>The full answer is R5.4. Learn its shape: <b>name the trade-off honestly, give the specific trigger that would change the decision, name the tool and why that tool.</b></p>`
},
{
q:'Attack 4 — observability',
test:'Whether "post-launch reliability ownership" has anything behind it.',
a:`<p>"Structured logging" is where your monitoring story ends. No metrics, no tracing, no alerting, no error-tracking tool named. For someone who claims to own reliability after launch, that is the biggest genuine hole on the page.</p>
<p>Own it in the room: logs today, and here is the order I would add things — error tracking first, then p95 latency and error rate with alerts, then tracing last because it costs the most to instrument. That sequencing <em>is</em> the senior answer.</p>`
},
{
q:'Attack 5 — thin AWS',
test:'Whether the cloud claims are wide or deep.',
a:`<p>EC2, S3, IAM. No RDS, no ECS or EKS, no Lambda, no CloudFront, no load balancer, no auto-scaling group. It reads like a few VMs with Docker on them — which is completely fine, but say so before they work it out. R9.1 has the wording.</p>`
},
{
q:'Attack 6 — backend testing',
test:'Whether the architecture you designed is tested.',
a:`<p>Jest appears under Prototion, five years ago, and nowhere in your two most recent roles — the ones where you own architecture. I will ask what your coverage looks like on the six services you designed.</p>
<p>Have a real answer. If the coverage is thin, say what is covered (the domain logic, the validation) and what is not (e2e), and what you would do first with a week.</p>`
},
{
q:'Attack 7 — the agency ceiling',
test:'Whether you can live with one product for three years.',
a:`<p>Three roles, all client-delivery shops. The doubt is whether you can iterate on a single product, own its debt, and care about retention rather than handover.</p>
<p>Your "why leaving" answer in R1.2 is built to defuse exactly this — it names handover as the limitation and turns it into the reason you want their job. Use it early, before they form the doubt.</p>`
},
{
q:'Attack 8 — Roorkee to Bangalore',
test:'Whether you will actually relocate, or take the offer and ask to stay remote in month two.',
a:`<p>You are listed as Roorkee-based and remote. Every interviewer will quietly wonder.</p>`,
note:`<p><b>Two resume edits to make tonight.</b> First: change <code>Roorkee, India · Open to relocation</code> to <code>Bangalore, India (relocated Sept 2026)</code>. You are physically there — say it in the past tense. This single edit measurably increases walk-in callbacks. Second: add one observability and one testing token to your skills line <em>if they are true</em> — Sentry, Winston, Supertest, e2e. If they are not true, spend one evening making one of them true on a side project so you can speak about it honestly.</p>`
},
{
q:'The reframe that fixes half of these',
test:'Nothing. This is the single most useful sentence on this page.',
a:`<p>Do not defend the gaps. <b>Convert them into decisions.</b></p>
<p>"We did not add a queue" is a weakness. "At five thousand users with a p95 under two hundred milliseconds, a queue would have been infrastructure we had to operate for no measurable gain — the point where I would add one is when notification sends started blocking the request path" is an architect talking.</p>
<p>The gap is identical. The candidate is not.</p>`
},
{
q:'Which loop are you in? Know by the end of the first conversation.',
test:'It tells you where to spend your energy.',
a:`<h4>Service &amp; consulting walk-in <span class="pill n">same day · 3–5 hours</span></h4>
<p>Two hundred people in a hall, a token number, a lot of waiting. Resume shortlist (2 min) → Technical 1, rapid-fire breadth (30–40 min) → Technical 2, projects and a light design question (40–60 min) → HR fitment (15 min).</p>
<p><b>How you win:</b> answer fast and confidently, never say "I have not used that" without immediately saying what you used instead, have your notice period and joining date ready. The failure mode is over-explaining — they have ninety candidates left to see.</p>

<h4>Series A–C product startup <span class="pill n">5–10 days · 4–5 rounds</span></h4>
<p>Recruiter screen (20 min) → <b>Machine coding (90–120 min)</b> → Technical deep dive (60 min) → System design (60 min) → Hiring manager (45 min) → HR close.</p>
<p><b>How you win:</b> the machine coding round decides it and everything after is confirmation. Practise building a small CRUD feature with clean module separation in ninety minutes until it is boring.</p>

<h4>Mid-size product &amp; SaaS <span class="pill n">2–3 weeks · 5 rounds</span></h4>
<p>Online assessment (2 DSA problems) → DSA interview (60 min) → Frontend or backend deep dive (60 min) → System design with a real bar (60 min) → Manager and values, often scored against a written rubric.</p>
<p><b>How you win:</b> do not walk into these cold. Give yourself the seven days first, spent mostly on DSA and design.</p>

<h4>Agency &amp; product studio <span class="pill n">2–4 days · 2–3 rounds</span></h4>
<p>Technical plus portfolio walkthrough (60 min) → take-home or pairing (often waived if your GitHub is convincing) → founder chat (30 min).</p>
<p><b>How you win:</b> your client-ownership story is their exact pain. Talk about delivery, estimation and client communication more than about code — and push hard for fully fixed pay.</p>`
}
]},
{
id:'r1', code:'R1', navTitle:'Screening call',
title:'The screening call',
meta:[['Length','15–25 min'],['Who','Recruiter, non-technical'],['Decides','Whether you exist'],['Fail mode','Rambling, or a bad number']],
tiers:[['service',1],['product',1],['saas',1],['agency',1]],
intro:'Nobody is assessing engineering here. They are checking that you are real, available, affordable and coherent for sixty seconds. Keep every answer under ninety seconds — the recruiter has twenty more calls today.',
qs:[
{
q:'Tell me about yourself.',
test:'Whether you can compress six years into a pitch, and whether you sound senior when you do it.',
say:`<p>I am a full-stack engineer, six years, all of it in TypeScript. For the last three at Skynox I have been the technical owner of four production client applications — Next.js on the front, NestJS services behind, deployed on AWS. That means I own architecture, release and reliability, not just features. The work I am proudest of is GetDandy, an AI front-office platform where I designed the service layer across five environments and cut infrastructure cost by a quarter. I have just moved to Bangalore and I am looking for a product role where I own a system for years instead of handing it over.</p>`,
a:`<p>Four beats: <b>what you are</b>, <b>what you own</b>, <b>one concrete proof</b>, <b>what you want next</b>. Sixty seconds, not four minutes.</p>
<p>Do not walk your career chronologically. Starting at 2020 and working forward is the single most common way this answer dies — by the time you reach the interesting part they have stopped listening.</p>`,
fu:['Which of those four applications was hardest and why?','You said you own reliability — what does that mean day to day?','Why full-stack rather than specialising?']
},
{
q:'Why are you leaving your current company?',
test:'Whether you badmouth. One negative sentence about a current employer costs you the loop, whatever else you say.',
say:`<p>Nothing is wrong there — I have grown a lot and I still like the team. The limit is structural: it is a client studio, so the natural end of a project is handover. I have never had the experience of owning a product for three years, living with my own architectural decisions and fixing the ones that turn out wrong. That is the specific thing I am looking for now.</p>`,
a:`<p>This works because it names a real limitation without blaming a person, and then converts into a reason to want <em>their</em> job. Every good "why leaving" answer is secretly a "why you" answer.</p>`,
trap:`<p>"The management is bad", "there is no growth", "the pay is low". Even when all three are true, saying them tells the recruiter what you will say about <em>them</em> in eighteen months. If money is genuinely the reason, say "the market has moved and my compensation has not kept pace with it" — that is honest and it is not a complaint about people.</p>`,
fu:['Did you raise this with your manager? What happened?','What would have made you stay?']
},
{
q:'What is your current CTC and what are you expecting?',
test:'Budget fit. This is the actual purpose of the call — everything before it was small talk.',
a:`<p>Give the number <em>with its structure attached</em>, because for you the structure is the leverage. Your package has no PF and no deductions, so your take-home and your cost-to-company are effectively the same figure. Almost no Bangalore offer works that way, and the recruiter does not know it yet.</p>`,
say:`<p>My current fixed is ₹12.2 lakh, and the important part is that it is entirely fixed and entirely in hand — no variable, no PF deduction, so I actually take home ₹1,02,000 every month. That is why I compare offers on monthly in-hand rather than CTC. For this role I am looking at ₹26 lakh, and I am flexible on how it is structured.</p>`,
after:`<p>That paragraph does four jobs at once: it is truthful, it is verifiable against your payslip, it teaches the recruiter that your effective rate is higher than your CTC looks, and it anchors before they anchor you. The full arithmetic is in <a href="#r12">R12</a>.</p>`,
trap:`<p>Inflating the current number. It is checked against your payslip and Form 16 at offer stage, and a discrepancy withdraws the offer at the last moment, when you have already resigned. Never do it.</p>`,
fu:['Is that fixed or does it include a variable?','Can you share a payslip?','That is on the higher side — what is the minimum you would consider?']
},
{
q:'What is your notice period and when can you join?',
test:'Their hiring timeline. A long notice quietly loses you startup offers that need someone in three weeks.',
a:`<p>Give the real number, then immediately give the shortest credible path: "It is X days on paper. I have a good relationship with my lead and I have negotiated buyouts before, so realistically I can be with you in [shortest honest figure]."</p>
<p>If your notice is long, this is the moment to plant the buyout: ask whether they reimburse it. Many companies do, it costs them almost nothing structurally, and it is the easiest concession you will ever win — but only if you raise it early rather than at offer stage.</p>`,
fu:['Would your employer let you buy out?','Do you have any bond or service agreement?']
},
{
q:'Are you actually relocating to Bangalore, or are you looking for remote?',
test:'They have been burned by this. Somebody took the offer, joined, and asked to stay remote in month two.',
say:`<p>I have already moved. I am in Bangalore now, I have a place, and I am here to work from an office. Remote was fine for three years but I want to be in a room with a team again.</p>`,
a:`<p>Say it in the past tense. "I am open to relocating" and "I have relocated" land completely differently — one is an intention, the other is a fact they can plan around.</p>`,
fu:['Which part of the city are you in?','How do you feel about five days in office?']
},
{
q:'Do you have any other offers or ongoing processes?',
test:'Urgency and market validation. A candidate nobody else wants is a candidate they can take their time with.',
say:`<p>I am in final rounds with two other companies and I expect to hear back next week. I am not in a rush to accept the first thing — I would rather choose properly — but I am working to that timeline.</p>`,
a:`<p>Never say "no, you are the only one." True or nearly true is fine here, but do not invent a specific company or a specific number: you may be asked to name it, and a fabrication that unravels ends the process.</p>`,
fu:['Which companies?','At what number?','When do you need to decide by?']
},
{
q:'Walk me through your last project in two minutes.',
test:'Whether you can describe technical work to a non-technical person. The recruiter has to repeat this to the hiring manager.',
a:`<p>Use the four-beat shape and rehearse it out loud tonight, because you will give this answer in every single loop you enter:</p>
<ul>
<li><b>Problem.</b> An AI front-office platform needed to answer inbound calls and hand off cleanly to humans.</li>
<li><b>Your role.</b> You designed and deployed the service layer across five environments.</li>
<li><b>The hard part.</b> Five environments with different data, secrets and provider keys, plus a real-time dashboard over agent performance and reliability metrics.</li>
<li><b>The result.</b> Infrastructure cost down twenty-five percent.</li>
</ul>
<p>No jargon the recruiter cannot repeat. "Service layer" is fine; "typed DTO validation at the boundary" is not — save that for R5.</p>`,
fu:['What was your specific contribution versus the team\'s?','How many engineers?','How long did it take?']
},
{
q:'How many years of hands-on TypeScript, React and Node — separately?',
test:'Resume arithmetic. Recruiters screen against a checklist with numbers on it.',
a:`<p>Have three separate numbers ready and keep them consistent across every conversation, because they get written down and compared later. For your profile: TypeScript six, React six, Node roughly four. If a number is smaller than the job asks for, give it and immediately give the strongest adjacent evidence rather than padding it.</p>`,
trap:`<p>Rounding every number up to your total experience. A recruiter who asks four of these and gets "six, six, six, six" stops believing all of them.</p>`
},
{
q:'The rest of the screening call',
test:'Nothing. These are box-ticks — answer in one line each and keep the call moving.',
a:`<ul>
<li>Highest qualification and year of passing. <em>B.Tech IT, Pantnagar, 2019.</em></li>
<li>Any employment gaps? <em>None — May 2020 to today, continuous.</em></li>
<li>Have you led a team? How many people?</li>
<li>Are you interviewing for frontend, backend or full-stack roles? <em>Answer full-stack, and if pressed say frontend-leaning full-stack — that is what your resume actually shows, and pretending otherwise gets exposed in R5.</em></li>
<li>Are you comfortable with the office location and a five-day model?</li>
<li>Do you have a passport? <em>(Asked by service companies with onsite roles.)</em></li>
<li>What is your date of birth / do you have a PAN? <em>(Background verification prep.)</em></li>
</ul>`
}
]},
{
id:'r2', code:'R2', navTitle:'Machine coding',
title:'Machine coding',
meta:[['Length','90–120 min'],['Who','Senior engineer, often silent'],['Decides','The startup loop, almost entirely'],['Fail mode','One giant file, nothing running']],
tiers:[['product',1],['saas',1],['agency',1],['service',0]],
intro:'You get a small product spec and a laptop. There is no algorithm in this round — the entire test is whether code you write under pressure looks like code from someone who has shipped. Your background should make this your strongest round, and it is where unprepared candidates with better resumes lose.',
pre:`<div class="table-scroll"><table>
<thead><tr><th>Weight</th><th>What is scored</th><th>What it means in the room</th></tr></thead>
<tbody>
<tr><td class="n">30%</td><td>It works</td><td>The happy path runs end to end. A beautiful non-working submission scores below an ugly working one, every time.</td></tr>
<tr><td class="n">25%</td><td>Separation of concerns</td><td>Components, hooks, services, types in separate files with clear boundaries. No business logic inside a JSX return.</td></tr>
<tr><td class="n">20%</td><td>Extensibility</td><td>They will say "now add X" in the last ten minutes. If that takes thirty seconds, you pass.</td></tr>
<tr><td class="n">15%</td><td>States &amp; edges</td><td>Loading, empty, error, disabled-while-submitting. Most candidates ship only the success state.</td></tr>
<tr><td class="n">10%</td><td>Naming &amp; types</td><td>No <code>any</code>. No <code>data2</code>. Types that describe the domain, not the shape of a fetch response.</td></tr>
</tbody></table></div>

<div class="note"><span class="lbl">The first ten minutes</span><p>Do not open the editor. Spend six to eight minutes out loud: restate the requirements in your own words, ask two clarifying questions, say what you will build and what you are explicitly leaving out, then sketch the file structure. Interviewers score this. Candidates who start typing at second thirty almost always finish with a mess.</p></div>`,
qs:[
{
q:'Build a task board with drag-and-drop between three columns, persisted locally.',
test:'Data modelling. The drag is theatre; the state shape is the exam.',
a:`<p>Skip a drag library unless it is explicitly allowed — the HTML5 <code>dragstart</code> / <code>dragover</code> / <code>drop</code> trio is enough and shows you know the platform. The decision they are watching for is <b>normalised state</b>:</p>`,
code:[{label:'the shape that makes reordering trivial',code:`type Task = { id: string; title: string; createdAt: number }

type Board = {
  tasks: Record&lt;string, Task&gt;          <span class="c">// id → task, one source of truth</span>
  columns: Record&lt;string, string[]&gt;    <span class="c">// columnId → ordered ids</span>
  order: string[]                      <span class="c">// column order</span>
}

<span class="c">// moving a card is two array operations, not a tree walk</span>
function move(b: Board, id: string, from: string, to: string, at: number): Board {
  const src = b.columns[from].filter(x =&gt; x !== id)
  const dst = from === to ? src : [...b.columns[to]]
  dst.splice(at, 0, id)
  return { ...b, columns: { ...b.columns, [from]: src, [to]: dst } }
}`}],
after:`<p>Nested arrays of task objects force a deep clone on every drag and make "which column is this card in" an O(n·m) search. Say that out loud as you choose — the reasoning scores higher than the result.</p>`,
fu:['Now persist it and reload without losing order.','Add an undo.','What happens if two tabs are open?']
},
{
q:'Build a searchable, filterable, paginated data table over a mock API.',
test:'Whether three interacting features fight each other. Most candidates build them independently and produce bugs.',
a:`<p>Derive the visible rows in <b>one pipeline</b>, memoised, and reset the page index whenever the filter or query changes. That reset is the bug they are looking for: filter down to three results while on page 4 and an unprepared implementation renders an empty table.</p>`,
code:[{code:`const rows = useMemo(() =&gt; {
  const q = query.trim().toLowerCase()
  return data
    .filter(r =&gt; !q || r.name.toLowerCase().includes(q))
    .filter(r =&gt; !status || r.status === status)
    .sort(BY[sortKey])
}, [data, query, status, sortKey])

const pageRows = rows.slice(page * SIZE, page * SIZE + SIZE)

<span class="o">useEffect(() =&gt; { setPage(0) }, [query, status])</span>  <span class="c">// the bit everyone forgets</span>`}],
after:`<p>Debounce the search input at ~300ms and say why. Put the fetch in a custom hook (<code>useTasks</code>), never inline in the component body — that single move is most of the "separation of concerns" score.</p>`,
fu:['Now make sorting server-side.','The dataset is 50,000 rows — what changes?','Make the filter state survive a page refresh.']
},
{
q:'Build a multi-step form with per-step validation and a review step.',
test:'Extensibility. The follow-up is always "add a fourth step" and they are timing you.',
a:`<p>Drive the steps from a config array, never a <code>switch</code>. Adding a step then means adding one object.</p>`,
code:[{code:`const STEPS = [
  { id: 'account', title: 'Account', fields: ['email','password'], schema: accountSchema },
  { id: 'profile', title: 'Profile', fields: ['name','phone'],     schema: profileSchema },
  { id: 'review',  title: 'Review',  fields: [],                   schema: null },
]

const step = STEPS[i]
const errors = step.schema ? validate(step.schema, form) : {}
const canNext = Object.keys(errors).length === 0`}],
after:`<p>Keep every step's data in one parent object rather than per-step state, so the review step is a read and going back does not lose input. Mention Zod and derive the TypeScript types from the schema with <code>z.infer</code>, so the runtime check and the compile-time type cannot drift apart.</p>`,
fu:['Add a fourth step.','Persist a half-finished form and resume it.','The last step submits — handle the failure.']
},
{
q:'Build a booking or calendar slot picker with conflict detection.',
test:'Interval logic and timezones. Directly on your resume, so expect it.',
a:`<p>Say up front that you have shipped a booking marketplace — it buys you credibility for the whole round. Then model slots as <b>half-open intervals</b> <code>[start, end)</code>, which makes back-to-back slots not overlap, and write the predicate as a named pure function:</p>`,
code:[{code:`<span class="c">// half-open: [aStart, aEnd) and [bStart, bEnd)</span>
const overlaps = (a: Slot, b: Slot) =&gt;
  a.start &lt; b.end &amp;&amp; b.start &lt; a.end

<span class="c">// 10:00–11:00 and 11:00–12:00 → false. Correct.</span>
<span class="c">// Using &lt;= here is the classic off-by-one that breaks adjacency.</span>`}],
after:`<p>Keep everything in UTC internally and format only at the edge. If they ask about recurring slots, the answer is: store the rule, expand to concrete instances for the visible window, and store exceptions separately — never store a thousand rows for a weekly repeat.</p>`,
fu:['Two people book the last seat at the same moment.','Handle a user in a different timezone.','Now support recurring weekly slots.']
},
{
q:'Backend variant — build a small REST API in NestJS.',
test:'Whether the layering on your resume is real when you have to type it in ninety minutes.',
a:`<p>Given your stack this may replace the frontend problem. Scaffold with the CLI, then make the layering visible: controller does HTTP only, service holds logic, repository touches data, DTOs validate at the boundary, one module per domain, a global exception filter.</p>`,
code:[{code:`src/
  bookings/
    bookings.controller.ts   <span class="c">// HTTP only — no logic</span>
    bookings.service.ts      <span class="c">// the actual rules</span>
    bookings.repository.ts   <span class="c">// data access</span>
    dto/create-booking.dto.ts
    entities/booking.entity.ts
    bookings.module.ts
  common/
    filters/http-exception.filter.ts
    interceptors/logging.interceptor.ts`}],
fu:['Add pagination.','Make POST idempotent.','Where would you put a transaction?']
},
{
q:'What do you say out loud while you are coding?',
test:'Nothing is being asked here — but the interviewer is scoring your narration, and silence scores zero.',
a:`<ul>
<li>"I am building the data model first, because everything else falls out of it."</li>
<li>"I am storing this normalised so a reorder is a splice rather than a deep clone."</li>
<li>"This goes in a hook so the component stays presentational and the logic is testable on its own."</li>
<li>"Debouncing here at 300ms — without it we fire a request per keystroke."</li>
<li>"I am doing the empty state now rather than at the end, because it is the state people actually see first."</li>
<li>"I would use Zod here in real code; for time I am hand-rolling it, but I would not ship this."</li>
<li>"This is the seam where optimistic updates would go."</li>
<li>"If this list went past a few thousand rows I would virtualise it. I am not doing that now because it is not the bottleneck at this size."</li>
<li>"That is the happy path working. With the remaining twenty minutes I will add the error state, then tidy naming."</li>
</ul>
<p>The last one matters most. Announcing your plan for the time you have left is the single clearest signal of a senior candidate rather than a fast one.</p>`
},
{
q:'The file skeleton to have in your fingers',
test:'Speed. If you have to invent a structure under time pressure you will invent a bad one.',
a:`<p>Rehearse this until you can produce it without thinking:</p>`,
code:[{code:`src/
  components/        <span class="c">// presentational only: props in, events out</span>
  features/&lt;name&gt;/   <span class="c">// the feature: its hooks, components, types</span>
  hooks/             <span class="c">// useDebounce, useLocalStorage, useFetch</span>
  lib/               <span class="c">// api client, formatters, pure helpers</span>
  types/             <span class="c">// domain types</span>`}],
after:`<p>Two rules that survive contact with a timer: a component that fetches is a feature, not a component; and anything you would unit-test goes in <code>lib/</code> or a hook, never inside JSX.</p>`
}
]},
{
id:'r3', code:'R3', navTitle:'JavaScript & TS',
title:'JavaScript & TypeScript',
meta:[['Length','30–60 min'],['Who','Senior engineer'],['Decides','Whether six years is real'],['Fail mode','Framework knowledge, no language knowledge']],
tiers:[['service',1],['product',1],['saas',1],['agency',1]],
intro:'The most common way a six-year candidate gets rejected is knowing React deeply and JavaScript shallowly. These are the questions that expose it. Every answer here has a shallow version that every candidate gives and a deep version that almost nobody does — the deep half is what is written out.',
qs:[
{
q:'Explain the event loop. Where do promises and <code>setTimeout</code> sit?',
test:'The single most-asked senior JavaScript question. They want the microtask/macrotask distinction, not "JavaScript is single-threaded and non-blocking".',
a:`<p>JavaScript runs one call stack. When the stack empties, the runtime drains the <b>microtask queue completely</b> — resolved promise callbacks, <code>queueMicrotask</code>, <code>MutationObserver</code> — and only then takes <b>one</b> macrotask: a timer, an I/O callback, a UI event. Then it drains microtasks again. So microtasks always run before the next macrotask, and a microtask that schedules another microtask can starve the loop entirely.</p>
<p>In Node the macrotask side is split into phases that run in a fixed order:</p>`,
code:[{label:'node event loop phases, in order',code:`timers        <span class="c">// setTimeout / setInterval callbacks</span>
pending       <span class="c">// some system-level callbacks</span>
poll          <span class="c">// I/O — where the loop actually waits</span>
check         <span class="c">// setImmediate</span>
close         <span class="c">// 'close' events (socket.on('close'))</span>

<span class="c">// between EVERY phase transition: drain nextTick queue, then microtasks</span>`},
{label:'the ordering question they will actually ask',code:`console.log('1')
setTimeout(() =&gt; console.log('2'), 0)
Promise.resolve().then(() =&gt; console.log('3'))
process.nextTick(() =&gt; console.log('4'))
queueMicrotask(() =&gt; console.log('5'))
console.log('6')

<span class="c">// 1 6 4 3 5 2</span>
<span class="c">// sync first (1,6), then nextTick (4) — its own queue, ahead of</span>
<span class="c">// promises — then microtasks in scheduling order (3,5), then timers (2)</span>`}],
after:`<p>Two extras that make you sound like you have debugged this rather than read it: <code>setTimeout(fn, 0)</code> is clamped to roughly 1ms and nested timers get clamped to 4ms after five levels; and in the browser, rendering happens between macrotasks, which is why a long microtask chain freezes the page while a chain of <code>setTimeout</code>s does not.</p>`,
trap:`<p>"Promises go to the callback queue and setTimeout goes to the callback queue, and the event loop picks them in order." That is the tutorial answer and it is wrong — there are two queues with different priorities, and the whole question exists to find out whether you know that.</p>`,
fu:['Why does an infinite promise chain freeze the browser but an infinite setTimeout chain does not?','Difference between setImmediate and setTimeout(fn, 0) in Node?','Where does async/await sit in this model?']
},
{
q:'What actually happens when you <code>await</code>?',
test:'Whether you understand async/await as syntax over promises, or think it is a new concurrency primitive.',
a:`<p><code>async</code> makes a function return a promise. <code>await</code> suspends the function, registers the rest of the body as a <code>.then</code> callback on the awaited value, and returns control to the caller. The continuation therefore runs as a <b>microtask</b> — which is why the code after an await never runs synchronously, even when you await a value that is already resolved.</p>`,
code:[{code:`async function f() {
  console.log('a')
  await null          <span class="c">// even a non-promise: still yields to the microtask queue</span>
  console.log('b')    <span class="c">// this is a microtask continuation</span>
}
f()
console.log('c')
<span class="c">// a c b</span>`}],
after:`<p>The practical consequence is sequencing. Two independent awaits run one after the other; if they do not depend on each other, that is wasted latency:</p>`,
fu:['Rewrite this to run them in parallel.','What happens if one of them rejects?','Does await block the event loop?']
},
{
q:'These two look the same. Which is faster and why?',
test:'Accidental sequential awaits — one of the most common real performance bugs in Node codebases.',
code:[{label:'sequential — 600ms',code:`const user  = await getUser(id)      <span class="c">// 200ms</span>
const posts = await getPosts(id)     <span class="c">// 200ms — waits for the line above for no reason</span>
const stats = await getStats(id)     <span class="c">// 200ms</span>`},
{label:'concurrent — 200ms',code:`const [user, posts, stats] = await Promise.all([
  getUser(id), getPosts(id), getStats(id)
])`}],
a:`<p>The three calls are independent, so the first version pays 600ms for 200ms of work. Note the subtlety worth saying out loud: the promises in <code>Promise.all</code> start executing the moment they are <em>created</em>, not when they are awaited — so even <code>const a = getUser(); const b = getPosts(); await a; await b;</code> is concurrent. It is the <code>await</code> on the call itself that serialises.</p>`,
trap:`<p>Blindly converting every sequential await to <code>Promise.all</code>. If <code>getPosts</code> needs the user id from <code>getUser</code>, they are genuinely dependent and must be sequential. Show that you check the dependency before you parallelise.</p>`,
fu:['What if one fails and you still want the others?','How would you limit this to 5 concurrent when there are 500?']
},
{
q:'<code>Promise.all</code> vs <code>allSettled</code> vs <code>race</code> vs <code>any</code>.',
test:'Whether you have chosen between these in production rather than memorised four names.',
a:`<div class="table-scroll"><table>
<thead><tr><th>Combinator</th><th>Settles when</th><th>Reach for it when</th></tr></thead>
<tbody>
<tr><td><code>all</code></td><td>All fulfil, or the first rejects</td><td>You need every piece — a dashboard that is meaningless with a missing panel.</td></tr>
<tr><td><code>allSettled</code></td><td>All settle, never rejects</td><td>Partial success is acceptable — fanning out to three third-party providers where one being down should not fail the request.</td></tr>
<tr><td><code>race</code></td><td>First to settle, either way</td><td>Timeouts. Race the work against a rejecting timer.</td></tr>
<tr><td><code>any</code></td><td>First to <em>fulfil</em>; rejects only if all reject</td><td>Redundant sources — three mirrors, take whichever answers first.</td></tr>
</tbody></table></div>`,
code:[{label:'the timeout pattern, and why AbortController matters',code:`<span class="c">// race gives you the timeout, but the losing request keeps running</span>
const withTimeout = (p, ms) =&gt; Promise.race([
  p,
  new Promise((_, rej) =&gt; setTimeout(() =&gt; rej(new Error('timeout')), ms))
])

<span class="c">// promises are NOT cancellable. To actually stop the work:</span>
const ac = new AbortController()
setTimeout(() =&gt; ac.abort(), 2000)
const res = await fetch(url, { signal: ac.signal })

<span class="c">// modern shorthand for exactly this:</span>
await fetch(url, { signal: AbortSignal.timeout(2000) })`}],
after:`<p>The line that scores: <em>"none of these cancel anything — <code>Promise.all</code> rejecting does not stop the sibling requests, they run to completion and their results are discarded. JavaScript promises are not cancellable, which is the entire reason <code>AbortController</code> exists."</em></p>`,
fu:['Implement Promise.all from scratch.','How do you cancel an in-flight fetch on unmount?','What does allSettled return for a rejected entry?']
},
{
q:'Implement <code>Promise.all</code> from scratch.',
test:'Asked constantly at senior level. The two failure points are preserving index order and handling the empty array.',
code:[{code:`function all(promises) {
  return new Promise((resolve, reject) =&gt; {
    const items = Array.from(promises)
    const out = new Array(items.length)
    let done = 0

    if (items.length === 0) return resolve([])   <span class="o">// the case people miss</span>

    items.forEach((p, i) =&gt; {
      <span class="c">// Promise.resolve handles non-promise values too</span>
      Promise.resolve(p).then(v =&gt; {
        out[i] = v                                <span class="o">// index, not push</span>
        if (++done === items.length) resolve(out)
      }, reject)                                  <span class="c">// first rejection wins; later ones are no-ops</span>
    })
  })
}`}],
a:`<p>Three things to narrate while writing it: <code>out[i] = v</code> rather than <code>out.push(v)</code>, because push gives you completion order not input order; the empty-array early return, because otherwise it never resolves; and that calling <code>reject</code> more than once is harmless, since a promise settles once and later calls are ignored.</p>`,
fu:['Now write allSettled.','Now write a version that limits concurrency to N.']
},
{
q:'Write a promise pool that runs at most N tasks concurrently.',
test:'Genuinely useful and genuinely common at senior level — rate-limited third-party APIs, bulk imports, image processing.',
code:[{code:`async function pool(tasks, limit = 5) {
  const results = new Array(tasks.length)
  let next = 0

  async function worker() {
    while (next &lt; tasks.length) {
      const i = next++          <span class="c">// grab an index, then release</span>
      results[i] = await tasks[i]()
    }
  }

  <span class="c">// N workers all pulling from the same index — no batching stalls</span>
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}

<span class="c">// tasks are FUNCTIONS returning promises, not promises —</span>
<span class="c">// a promise has already started, so it cannot be throttled</span>
await pool(urls.map(u =&gt; () =&gt; fetch(u)), 5)`}],
a:`<p>The detail that separates a good answer from a great one: <b>tasks must be thunks</b>. If you pass an array of promises they have already started and the pool controls nothing. Say that unprompted.</p>
<p>The other detail: this is a worker-pull design, not batching. Chunking into groups of five and awaiting each group means the whole group waits for its slowest member — with N workers pulling from a shared cursor, a fast worker immediately picks up the next item.</p>`,
fu:['What if one task throws?','Add a retry with backoff.','How would you preserve order if tasks finish out of order?']
},
{
q:'Write retry with exponential backoff.',
test:'Whether you know that naive retries make outages worse.',
code:[{code:`async function retry(fn, { tries = 4, base = 300, factor = 2, jitter = true } = {}) {
  let lastErr
  for (let i = 0; i &lt; tries; i++) {
    try { return await fn() }
    catch (err) {
      lastErr = err
      if (!isRetryable(err) || i === tries - 1) throw err
      const wait = base * factor ** i
      <span class="o">const delay = jitter ? wait * (0.5 + Math.random()) : wait</span>
      await new Promise(r =&gt; setTimeout(r, delay))
    }
  }
  throw lastErr
}

<span class="c">// don't retry what will never succeed</span>
const isRetryable = e =&gt;
  e.name === 'TimeoutError' || [429, 502, 503, 504].includes(e.status)`}],
a:`<p>Two things they are listening for. <b>Jitter</b>: without it, a thousand clients that failed together retry together and re-create the exact spike that caused the outage — this is the thundering herd, and randomising the delay is the fix. And <b>retryability</b>: a 400 or a 404 will never succeed on retry, so retrying it just burns time and quota. Retry timeouts, 429s and 5xx; fail fast on 4xx.</p>`,
fu:['Where does a circuit breaker fit relative to this?','What do you do after the last retry fails?','Is retrying a POST safe?']
},
{
q:'What is a closure? Give me one from your own code.',
test:'Everyone has the definition. Almost nobody has the memory-leak half.',
a:`<p>A closure is a function together with the scope it was defined in, kept alive after that scope has returned. The definition is the cheap part — go straight to a real one:</p>`,
code:[{code:`function debounce(fn, ms) {
  let timer                       <span class="o">// closed over, private, survives every call</span>
  return (...args) =&gt; {
    clearTimeout(timer)
    timer = setTimeout(() =&gt; fn(...args), ms)
  }
}`},{label:'the leak',code:`<span class="c">// BAD — every call adds a listener that captures the payload forever</span>
function handle(req) {
  const bigPayload = req.body
  emitter.on('tick', () =&gt; log(bigPayload.id))
}

<span class="c">// FIX — remove it, or use once()</span>
function handle(req) {
  const onTick = () =&gt; log(req.body.id)
  emitter.on('tick', onTick)
  req.on('close', () =&gt; emitter.off('tick', onTick))
}`}],
after:`<p>Then the senior half: closures are the main way you leak memory in a long-lived Node process. A closure that captures a large object keeps it unreachable-for-collection as long as the returned function is referenced. The classic production leak is an event listener that closes over a request context and is never removed — every request adds a listener, each pinning its own context, and the heap climbs until the process dies.</p>`,
fu:['How would you find that leak in production?','What does a WeakMap solve here?','Why does a loop with var and setTimeout print the same number?']
},
{
q:'Why does this print 3, 3, 3 — and what are the two fixes?',
test:'Scope and closures together. Still asked because it separates people who understand binding from people who memorised "use let".',
code:[{code:`for (var i = 0; i &lt; 3; i++) setTimeout(() =&gt; console.log(i))
<span class="c">// 3 3 3</span>`},{code:`<span class="c">// 1. let — a NEW binding per iteration, which the spec creates deliberately</span>
for (let i = 0; i &lt; 3; i++) setTimeout(() =&gt; console.log(i))   <span class="c">// 0 1 2</span>

<span class="c">// 2. an IIFE capturing the value — how everyone did it before ES6</span>
for (var i = 0; i &lt; 3; i++) (j =&gt; setTimeout(() =&gt; console.log(j)))(i)`}],
a:`<p><code>var</code> is function-scoped, so all three callbacks close over the <b>same</b> binding. The loop finishes before any timer fires, and by then that single <code>i</code> is 3.</p>
<p>Two fixes, and knowing why the first works is the actual answer:</p>`,
fu:['Does the same happen with a for…of loop?','What about const in a for loop?']
},
{
q:'Explain <code>this</code>. How is an arrow function different?',
test:'Whether you know that <code>this</code> is decided at call time, not at definition time.',
a:`<p><code>this</code> is determined by <b>how the function is called</b>, and there are exactly five rules, checked in this order:</p>
<ol>
<li><code>new Fn()</code> → the newly created object.</li>
<li><code>fn.call(x)</code> / <code>apply</code> / <code>bind</code> → whatever you passed.</li>
<li><code>obj.fn()</code> → <code>obj</code>, the thing before the dot.</li>
<li>Plain <code>fn()</code> → <code>undefined</code> in strict mode and modules, <code>globalThis</code> in sloppy mode.</li>
<li>Arrow function → none of the above. Arrows have no <code>this</code> binding at all; they resolve it lexically from the enclosing scope, and <code>bind</code> cannot change it.</li>
</ol>`,
code:[{label:'the losing-this bug, and the three fixes',code:`class Counter {
  count = 0
  inc() { this.count++ }
  incArrow = () =&gt; { this.count++ }   <span class="c">// class field: lexical this</span>
}
const c = new Counter()
const f = c.inc
f()                       <span class="c">// TypeError — this is undefined, the dot is gone</span>

f.call(c)                 <span class="c">// fix 1</span>
const g = c.inc.bind(c)   <span class="c">// fix 2</span>
const h = c.incArrow      <span class="c">// fix 3 — works detached</span>`}],
after:`<p>And the flip side that shows judgement: an arrow is <em>wrong</em> as an object method or on a prototype, because there is no dynamic <code>this</code> to pick up the instance — <code>const o = { n: 1, get: () =&gt; this.n }</code> is always broken.</p>`,
fu:['What is this inside a plain callback passed to forEach?','Why do class methods need bind in React class components but not with arrow fields?','Implement bind yourself.']
},
{
q:'Implement <code>bind</code>.',
test:'Combines this-binding, closures, rest args and — if you go all the way — the <code>new</code> case.',
code:[{code:`Function.prototype.myBind = function (ctx, ...bound) {
  const fn = this
  if (typeof fn !== 'function') throw new TypeError('not callable')

  function wrapper(...args) {
    <span class="c">// if called with new, ignore ctx and use the fresh instance</span>
    const calledWithNew = this instanceof wrapper
    return fn.apply(calledWithNew ? this : ctx, [...bound, ...args])
  }
  wrapper.prototype = Object.create(fn.prototype || null)
  return wrapper
}`}],
a:`<p>Most candidates stop at <code>fn.apply(ctx, [...bound, ...args])</code>, which is a fine answer. The <code>new</code> handling is what gets you remembered — a bound function used as a constructor is supposed to ignore the bound <code>this</code>.</p>`,
fu:['What does partial application mean here?','Can you bind an arrow function?']
},
{
q:'Explain the prototype chain.',
test:'Whether "class" means anything to you beyond syntax.',
a:`<p>Every object has an internal link (<code>[[Prototype]]</code>, reachable via <code>Object.getPrototypeOf</code>) to another object. Property lookup walks that chain until it finds the key or hits <code>null</code>. <code>class</code> is syntax over this: methods live on <code>Constructor.prototype</code> and are <b>shared by every instance</b>, which is why defining methods inside the constructor body instead wastes one function object per instance.</p>`,
code:[{code:`class A { hi() {} }          <span class="c">// hi lives once, on A.prototype</span>
function B() { this.hi = () =&gt; {} }   <span class="c">// a new closure per instance</span>

const a1 = new A(), a2 = new A()
a1.hi === a2.hi              <span class="c">// true</span>

<span class="c">// a prototype-free object is the correct shape for a lookup map:</span>
const map = Object.create(null)
map.toString                 <span class="c">// undefined — no inherited keys to collide with</span>
({}).toString                <span class="c">// function — which is why {} as a map is a bug waiting</span>`}],
after:`<p><code>__proto__</code> is the (deprecated) accessor for the link; <code>prototype</code> is a property that only functions have, and it is the object that will become the <code>[[Prototype]]</code> of instances they construct. Getting that distinction right in one sentence is most of the marks.</p>`,
fu:['What is prototype pollution and how do you prevent it?','Difference between __proto__ and prototype?','How does instanceof work?']
},
{
q:'<code>var</code>, <code>let</code>, <code>const</code>, and what is the temporal dead zone?',
test:'Hoisting. A one-line answer here is fine — a wrong one is fatal.',
a:`<p><code>var</code> is function-scoped and hoisted <em>initialised to <code>undefined</code></em>. <code>let</code> and <code>const</code> are block-scoped and hoisted <em>uninitialised</em> — the span between the top of the block and the declaration is the temporal dead zone, and touching the binding there throws a <code>ReferenceError</code> rather than silently giving <code>undefined</code>. That is the entire point of the TDZ: it turns a silent bug into a loud one.</p>
<p><code>const</code> prevents <b>rebinding</b>, not mutation. <code>const a = []; a.push(1)</code> is legal. For real immutability you need <code>Object.freeze</code>, and that is shallow.</p>`,
code:[{code:`console.log(v)   <span class="c">// undefined — hoisted and initialised</span>
var v = 1

console.log(l)   <span class="c">// ReferenceError: Cannot access 'l' before initialization</span>
let l = 1

typeof undeclared   <span class="c">// "undefined" — safe</span>
typeof l            <span class="c">// ReferenceError if l is in its TDZ — the one place typeof throws</span>`}],
fu:['Are function declarations hoisted differently from function expressions?','Why is const the default in modern code?']
},
{
q:'Deep clone an object. What are the failure modes?',
test:'Whether you still reach for the JSON trick and whether you know what it destroys.',
a:`<p><code>structuredClone(obj)</code> is the modern answer — built into browsers and Node, handles <code>Date</code>, <code>Map</code>, <code>Set</code>, <code>RegExp</code>, typed arrays, <code>ArrayBuffer</code> and <b>circular references</b>.</p>
<p>The answer most candidates give, <code>JSON.parse(JSON.stringify(x))</code>, silently destroys a lot:</p>`,
code:[{code:`const src = {
  d: new Date(), m: new Map([['a',1]]), s: new Set([1]),
  u: undefined, f: () =&gt; {}, n: NaN, i: Infinity, big: 10n
}
JSON.parse(JSON.stringify(src))
<span class="c">// d   → "2026-09-05T..."  a string, not a Date</span>
<span class="c">// m,s → {}               emptied</span>
<span class="c">// u,f → dropped entirely (keys disappear)</span>
<span class="c">// n,i → null</span>
<span class="c">// big → throws TypeError</span>
<span class="c">// circular → throws</span>`},{label:'hand-rolled, cycle-safe',code:`function clone(v, seen = new WeakMap()) {
  if (v === null || typeof v !== 'object') return v
  if (seen.has(v)) return seen.get(v)          <span class="o">// the cycle guard</span>
  const out = Array.isArray(v) ? [] : Object.create(Object.getPrototypeOf(v))
  seen.set(v, out)
  for (const k of Reflect.ownKeys(v)) out[k] = clone(v[k], seen)
  return out
}`}],
after:`<p>What <code>structuredClone</code> still cannot do: functions, DOM nodes, class prototypes (you get a plain object back, not an instance), and getters/setters. If you need those, a hand-written recursive clone with a <code>WeakMap</code> of already-seen objects is the answer — and the <code>WeakMap</code> is what handles cycles.</p>`,
fu:['Why WeakMap and not Map here?','What is a shallow clone and when is it enough?']
},
{
q:'Implement debounce and throttle, and tell me where you used each.',
test:'Everyone can define them. Few can write throttle correctly or name a real use.',
code:[{label:'debounce — waits for silence',code:`function debounce(fn, ms) {
  let t
  const wrapped = (...a) =&gt; {
    clearTimeout(t)
    t = setTimeout(() =&gt; fn(...a), ms)
  }
  wrapped.cancel = () =&gt; clearTimeout(t)    <span class="o">// needed for cleanup on unmount</span>
  return wrapped
}`},
{label:'throttle — guarantees a maximum rate',code:`function throttle(fn, ms) {
  let last = 0, timer = null, lastArgs
  return (...a) =&gt; {
    const now = Date.now()
    lastArgs = a
    if (now - last &gt;= ms) { last = now; fn(...a) }
    else if (!timer) {
      <span class="c">// trailing call, so the final event is not swallowed</span>
      timer = setTimeout(() =&gt; {
        timer = null; last = Date.now(); fn(...lastArgs)
      }, ms - (now - last))
    }
  }
}`}],
a:`<p><b>Debounce</b> waits for the input to stop: search-as-you-type, autosave, resize-then-recalculate. <b>Throttle</b> guarantees a maximum rate: scroll handlers, drag, mousemove, analytics pings.</p>
<p>Concrete answer for "where did you use it": the faceted search on your camp-booking marketplace was debounced at 300ms — without it, filtering across location, age, interest and price fired a request per keystroke per facet.</p>`,
trap:`<p>A throttle with no trailing call. The naive version drops the last event, so a user who stops scrolling mid-gesture never gets the final position and the UI ends up out of sync. Mentioning the trailing edge unprompted is the difference here.</p>`,
fu:['Which one would you use for an autosave?','How do you cancel a pending debounce when a component unmounts?','requestAnimationFrame vs throttle for scroll?']
},
{
q:'Explain event bubbling, capturing and delegation.',
test:'DOM fundamentals, and whether you understand what React is doing under its synthetic events.',
a:`<p>An event travels down from the root to the target (<b>capture</b> phase), fires on the target, then travels back up (<b>bubble</b> phase). Listeners default to the bubble phase; pass <code>{ capture: true }</code> for the way down.</p>
<p><b>Delegation</b> is putting one listener on a common ancestor and working out which descendant was hit — one listener instead of a thousand, and it keeps working for rows added to the DOM later:</p>`,
code:[{code:`list.addEventListener('click', (e) =&gt; {
  const row = e.target.closest('[data-id]')     <span class="o">// not e.target directly</span>
  if (!row || !list.contains(row)) return
  open(row.dataset.id)
})`}],
after:`<p><code>e.target</code> is what was actually clicked (possibly a span inside the row); <code>e.currentTarget</code> is the element the listener is on. Using <code>closest()</code> instead of <code>e.target</code> is what makes delegation robust against nested markup.</p>
<p>Also distinguish <code>stopPropagation()</code> (stop travelling) from <code>preventDefault()</code> (stop the browser's default action) — they are unrelated and candidates mix them up constantly. And note that some events do not bubble: <code>focus</code>, <code>blur</code>, <code>load</code>, <code>mouseenter</code> — which is why <code>focusin</code> and <code>focusout</code> exist.</p>`,
fu:['How does React attach its events?','How do you delegate a focus event?','What does passive: true do on a scroll listener?']
},
{
q:'<code>==</code> vs <code>===</code>. Is there any legitimate use of <code>==</code>?',
test:'Coercion. Also whether you speak in absolutes or in judgement.',
a:`<p><code>===</code> compares type and value. <code>==</code> applies the abstract equality algorithm, which coerces first — <code>null == undefined</code> is true, <code>'1' == 1</code> is true, <code>[] == false</code> is true.</p>
<p>There is exactly one idiom worth keeping: <code>x == null</code> is true for precisely <code>null</code> and <code>undefined</code> and nothing else. It is the shortest correct nullish check and it is genuinely useful. Everywhere else, <code>===</code>.</p>`,
code:[{code:`NaN === NaN            <span class="c">// false — use Number.isNaN or Object.is</span>
Object.is(NaN, NaN)    <span class="c">// true</span>
Object.is(0, -0)       <span class="c">// false — the other case Object.is differs on</span>

0 == ''                <span class="c">// true</span>
null == 0              <span class="c">// false  (null only equals undefined)</span>
[] == ![]              <span class="c">// true   — the party trick</span>`}],
fu:['How does Object.is differ from ===?','What does the + operator do with an object?','Why is typeof null "object"?']
},
{
q:'Map vs Object. Set vs Array. When would you use a WeakMap?',
test:'Whether you pick data structures on purpose.',
a:`<div class="table-scroll"><table>
<thead><tr><th></th><th>Object</th><th>Map</th></tr></thead>
<tbody>
<tr><td>Keys</td><td>Strings and symbols only</td><td>Anything, including objects and NaN</td></tr>
<tr><td>Order</td><td>Integer-like keys sort first — surprising</td><td>Insertion order, always</td></tr>
<tr><td>Size</td><td><code>Object.keys(o).length</code> — O(n)</td><td><code>map.size</code> — O(1)</td></tr>
<tr><td>Inherited keys</td><td>Yes, unless <code>Object.create(null)</code></td><td>Never</td></tr>
<tr><td>JSON</td><td>Serialises directly</td><td>Does not — needs conversion</td></tr>
</tbody></table></div>
<p>Rule of thumb: <b>Map for a collection you add to and delete from at runtime; object for a fixed-shape record you will serialise.</b></p>
<p><code>Set</code> gives O(1) membership against <code>Array.includes</code> at O(n) — this is the standard fix when a <code>filter</code> containing an <code>includes</code> turns quadratic and a page hangs at ten thousand rows.</p>`,
code:[{label:'the quadratic bug and its one-line fix',code:`<span class="c">// O(n·m) — 10k × 10k = 100 million comparisons</span>
const missing = all.filter(x =&gt; !existing.includes(x.id))

<span class="c">// O(n + m)</span>
const have = new Set(existing)
const missing = all.filter(x =&gt; !have.has(x.id))`}],
after:`<p><code>WeakMap</code> holds its keys <b>weakly</b>: an entry disappears when nothing else references the key object. Use it to attach metadata to objects you do not own — caches keyed by an object, per-instance private data, or the cycle-guard in a deep clone — without preventing garbage collection. It is not enumerable and has no <code>size</code>, precisely because entries can vanish at any moment.</p>`,
fu:['Why can a WeakMap key not be a string?','How would you build an LRU cache with a Map?','What order does Object.keys return?']
},
{
q:'What does <code>reduce</code> actually do? Write <code>groupBy</code> with it.',
test:'Whether you can use reduce for something other than summing an array.',
code:[{code:`const groupBy = (arr, keyOf) =&gt;
  arr.reduce((acc, item) =&gt; {
    const k = keyOf(item)
    ;(acc[k] ||= []).push(item)
    return acc
  }, {})

groupBy(bookings, b =&gt; b.status)
<span class="c">// { pending: [...], confirmed: [...] }</span>`}],
a:`<p>Say the accumulator sentence: reduce folds a collection into a single value by threading an accumulator through, and the accumulator can be any shape — a number, an object, a Map, another array.</p>`,
note:`<p>Modern runtimes have <code>Object.groupBy(arr, fn)</code> and <code>Map.groupBy</code> built in. Mentioning that you would reach for the built-in and only hand-roll for older targets is a small, cheap credibility win.</p>`,
fu:['Rewrite it to return a Map.','When is reduce the wrong choice? (When a for…of is clearer — say so.)']
},
{
q:'ESM vs CommonJS — and why does <code>import</code> hoist but <code>require</code> not?',
test:'Module systems. Comes up constantly in Node interviews because teams are still mid-migration.',
a:`<p><code>require</code> is a <b>runtime function call</b>: it executes wherever it appears, resolves synchronously, and returns a value you can compute — <code>require(cond ? 'a' : 'b')</code> is legal. <code>import</code> is a <b>static declaration</b>: the specifiers are parsed before any code runs, which is what makes the module graph knowable ahead of execution.</p>
<p>Three consequences worth naming:</p>
<ul>
<li><b>Hoisting.</b> All imports are resolved and evaluated before the importing module's body runs.</li>
<li><b>Live bindings.</b> ESM imports are references to the exporting module's binding, not copies. If the exporter reassigns, the importer sees the new value. CommonJS copies the value at require time.</li>
<li><b>Tree shaking.</b> Only possible because the graph is static — a bundler can prove an export is unused. CommonJS cannot be shaken reliably.</li>
</ul>`,
code:[{code:`<span class="c">// ESM live binding</span>
<span class="c">// counter.js</span>
export let n = 0
export const inc = () =&gt; n++

<span class="c">// main.js</span>
import { n, inc } from './counter.js'
inc(); console.log(n)     <span class="c">// 1 — CommonJS would print 0</span>

<span class="c">// top-level await: ESM only</span>
const cfg = await loadConfig()`}],
after:`<p>Also know the interop rule, because it bites in real projects: ESM can import CommonJS (the whole <code>module.exports</code> arrives as the default export), but CommonJS cannot <code>require</code> an ESM module — it must use dynamic <code>import()</code>, which is async. That asymmetry is why so many Node codebases stall halfway through the migration.</p>`,
fu:['What breaks tree shaking? (Side effects, barrel files, CommonJS.)','What does "type": "module" do in package.json?','What is a side-effectful import?']
},
{
q:'What is tree shaking and what silently breaks it?',
test:'Bundle size awareness — directly relevant to your page-load work.',
a:`<p>Tree shaking is dead-code elimination over the static ESM graph: the bundler proves an export is never used and drops it. Four things break it:</p>
<ul>
<li><b>Side effects.</b> If a module does work at import time, the bundler cannot prove removing it is safe. Declaring <code>"sideEffects": false</code> in <code>package.json</code> (or listing the files that do have them) is what tells it otherwise.</li>
<li><b>CommonJS.</b> Dynamic requires cannot be statically analysed.</li>
<li><b>Barrel files.</b> An <code>index.ts</code> re-exporting everything makes one import pull the whole directory into the graph. This is the most common real cause and it is worth naming, because it is also a build-speed problem.</li>
<li><b>Namespace imports.</b> <code>import * as _ from 'lodash'</code> defeats it; <code>import debounce from 'lodash/debounce'</code> does not.</li>
</ul>`,
fu:['How would you find what is making a bundle large?','What is code splitting and how does it differ from tree shaking?']
},
{
q:'Rapid-fire JavaScript — one clean sentence each',
test:'Breadth. Service-company rounds run twenty of these in thirty minutes and score you on speed, not depth.',
a:`<ul>
<li><b>null vs undefined.</b> <code>undefined</code> means never assigned; <code>null</code> is an assigned "nothing". Only <code>null</code> is intentional.</li>
<li><b>Why is <code>typeof null === "object"</code>?</b> A bug from 1995 kept for backwards compatibility.</li>
<li><b>Hoisting of functions.</b> Function <em>declarations</em> are hoisted whole and callable before their line; function <em>expressions</em> assigned to <code>var</code> are <code>undefined</code> until the assignment runs.</li>
<li><b>Currying.</b> <code>const add = a =&gt; b =&gt; c =&gt; a + b + c</code> — one argument at a time, returning a function until saturated.</li>
<li><b>IIFE.</b> Pre-module scope isolation. With ESM it is largely obsolete; blocks and modules do the job.</li>
<li><b><code>??</code> vs <code>||</code>.</b> <code>||</code> falls through on any falsy value, so <code>0 || 10</code> is 10 — a real bug with counts and prices. <code>??</code> only falls through on <code>null</code>/<code>undefined</code>.</li>
<li><b>Optional chaining.</b> <code>a?.b?.()</code> short-circuits to <code>undefined</code> instead of throwing. It does not protect against a <em>missing variable</em>, only a nullish property.</li>
<li><b>Generators.</b> Functions that can pause and resume with <code>yield</code>. Real sighting: Redux Saga, and lazy infinite sequences.</li>
<li><b><code>Object.freeze</code>.</b> Shallow — nested objects stay mutable. Deep freeze needs recursion.</li>
<li><b>Symbol.</b> A guaranteed-unique property key. Used for metadata that must not collide, and for protocol hooks like <code>Symbol.iterator</code>.</li>
<li><b>Iterators.</b> Anything with a <code>[Symbol.iterator]</code> works with <code>for…of</code> and spread. That is how you make a custom class spreadable.</li>
<li><b>Event delegation vs direct binding.</b> Fewer listeners, works for future nodes.</li>
<li><b>Pass by value or reference?</b> Always by value — but for objects the value <em>is</em> a reference.</li>
<li><b><code>slice</code> vs <code>splice</code>.</b> <code>slice</code> returns a copy and does not mutate; <code>splice</code> mutates in place and returns what it removed.</li>
<li><b><code>for…in</code> vs <code>for…of</code>.</b> <code>in</code> walks enumerable keys including inherited ones; <code>of</code> walks values of an iterable. Almost never use <code>for…in</code> on an array.</li>
</ul>`
}
]},
{
id:'r3ts', code:'R3·TS', navTitle:'TypeScript',
title:'TypeScript, properly',
meta:[['Length','Folded into R3'],['Who','Senior engineer'],['Decides','Whether "TypeScript" means typed JS or types'],['Fail mode','Knowing the syntax, not the type system']],
tiers:[['product',1],['saas',1],['agency',1],['service',0]],
intro:'Your resume says six years of TypeScript across both ends. That raises the bar rather than lowering it: they will not ask what an interface is, they will ask you to write a mapped type.',
qs:[
{
q:'<code>interface</code> vs <code>type</code>.',
test:'Whether you have a practical rule or a memorised list of differences.',
a:`<p><code>interface</code> supports declaration merging and <code>extends</code>, and is the conventional choice for object shapes and public API contracts a consumer might augment. <code>type</code> can express everything an interface cannot: unions, intersections, tuples, mapped types, conditional types, and aliases of primitives.</p>
<p>The practical rule, which is the answer they want: <b>interface for object shapes you may extend or that a library consumer may augment; type for everything else.</b> Do not invent a deep philosophical difference — interviewers respect the practical answer.</p>`,
code:[{code:`<span class="c">// declaration merging — only interfaces do this</span>
interface Window { myApp: App }        <span class="c">// augments the global Window</span>

<span class="c">// unions — only types do this</span>
type Status = 'idle' | 'loading' | 'done'
type Id = string | number`}],
fu:['Which would you use for a React component\'s props?','Can a type extend an interface? (Yes, via intersection.)']
},
{
q:'Write a generic function you have actually needed.',
test:'Whether generics are a tool you use or a chapter you read.',
code:[{code:`async function apiGet&lt;T&gt;(url: string): Promise&lt;T&gt; {
  const res = await fetch(url)
  if (!res.ok) throw new ApiError(res.status, url)
  return res.json() as Promise&lt;T&gt;
}`},{label:'one source of truth for the shape',code:`import { z } from 'zod'

const User = z.object({ id: z.string(), email: z.string().email() })
type User = z.infer&lt;typeof User&gt;      <span class="o">// derived, never hand-written</span>

async function apiGet&lt;S extends z.ZodTypeAny&gt;(url: string, schema: S): Promise&lt;z.infer&lt;S&gt;&gt; {
  const res = await fetch(url)
  return schema.parse(await res.json())   <span class="c">// throws on a contract break, loudly</span>
}`}],
a:`<p>Then deliver the honest caveat, which is the actual senior answer: <b>this is a lie to the compiler.</b> <code>res.json()</code> returns whatever the server sent; the generic asserts a shape nobody verified. If the contract matters, parse it and infer the type from the schema so the runtime check and the compile-time type cannot drift apart:</p>`,
fu:['What does `extends` mean in a generic constraint?','How would you type a function that takes a key of an object and returns that property\'s type?']
},
{
q:'Write <code>Partial</code>, <code>Pick</code>, <code>Omit</code>, <code>Readonly</code> from scratch.',
test:'Mapped types. Naming the utilities is worth nothing; writing them is the question.',
code:[{code:`type MyPartial&lt;T&gt;  = { [K in keyof T]?: T[K] }
type MyRequired&lt;T&gt; = { [K in keyof T]-?: T[K] }        <span class="c">// -? strips optionality</span>
type MyReadonly&lt;T&gt; = { readonly [K in keyof T]: T[K] }

type MyPick&lt;T, K extends keyof T&gt; = { [P in K]: T[P] }
type MyOmit&lt;T, K extends keyof T&gt; = MyPick&lt;T, Exclude&lt;keyof T, K&gt;&gt;

type MyRecord&lt;K extends keyof any, V&gt; = { [P in K]: V }

<span class="c">// key remapping (TS 4.1+) — rename while mapping</span>
type Getters&lt;T&gt; = {
  [K in keyof T as \`get\${Capitalize&lt;string &amp; K&gt;}\`]: () =&gt; T[K]
}
<span class="c">// Getters&lt;{ name: string }&gt;  →  { getName: () =&gt; string }</span>`}],
a:`<p>The <code>-?</code> modifier and key remapping with <code>as</code> are the two details that mark you as someone who writes types rather than consumes them.</p>`,
fu:['What is a conditional type? Write one.','What does infer do?']
},
{
q:'<code>any</code> vs <code>unknown</code> vs <code>never</code>.',
test:'Whether your codebases are actually type-safe or just annotated.',
a:`<ul>
<li><b><code>any</code></b> switches the checker off for that value and is contagious — anything derived from it is also unchecked. It is the escape hatch, and every <code>any</code> is a small hole in the guarantee.</li>
<li><b><code>unknown</code></b> is the safe top type: you can hold anything, but you must narrow before you use it. It is the correct type for JSON you just parsed, for a caught error, and for anything crossing a trust boundary.</li>
<li><b><code>never</code></b> is the empty type — the return type of a function that always throws, and the tool for exhaustiveness checking.</li>
</ul>`,
code:[{label:'the exhaustiveness check — the most useful never in practice',code:`type Status = 'idle' | 'loading' | 'done'

function label(s: Status) {
  switch (s) {
    case 'idle':    return 'Ready'
    case 'loading': return 'Working'
    case 'done':    return 'Finished'
    default:
      const _exhaustive: never = s     <span class="o">// compile error the day someone adds 'error'</span>
      throw new Error(\`unhandled: \${s}\`)
  }
}`},
{label:'catch is unknown, not Error',code:`try { risky() }
catch (e) {
  <span class="c">// e is unknown under useUnknownInCatchVariables — anything can be thrown</span>
  if (e instanceof Error) log(e.message)
  else log(String(e))
}`}],
fu:['Why is `catch (e: any)` dangerous?','When is `any` genuinely the right answer? (Migrating a large JS codebase incrementally.)']
},
{
q:'What is a discriminated union and why do you care?',
test:'Whether you make impossible states unrepresentable, or model everything as optional fields.',
a:`<p>A union of object types sharing a literal field the compiler can narrow on. It is the single most valuable pattern in application TypeScript.</p>`,
code:[{label:'sixteen possible states, most of them nonsense',code:`type Bad&lt;T&gt; = {
  loading: boolean
  data?: T
  error?: string
}
<span class="c">// loading:true + data + error  — meaningless, but legal</span>`},
{label:'three states, all of them real',code:`type Result&lt;T&gt; =
  | { status: 'loading' }
  | { status: 'ok';    data: T }
  | { status: 'error'; error: string }

if (r.status === 'ok') r.data      <span class="o">// narrowed — data exists here and nowhere else</span>`}],
after:`<p>Say the phrase "make impossible states unrepresentable" — it is the actual design principle and interviewers who know it will notice you know it.</p>`,
fu:['How does the compiler narrow this?','What is a type guard? Write one with the is keyword.']
},
{
q:'Write a type guard and explain <code>x is T</code>.',
test:'Narrowing beyond typeof and instanceof.',
code:[{code:`type Cat = { kind: 'cat'; meow(): void }
type Dog = { kind: 'dog'; bark(): void }

<span class="c">// the return type 'pet is Cat' teaches the compiler, it does not check anything</span>
function isCat(pet: Cat | Dog): pet is Cat {
  return pet.kind === 'cat'
}

<span class="c">// assertion function — narrows for the rest of the scope</span>
function assertDefined&lt;T&gt;(v: T, msg = 'missing'): asserts v is NonNullable&lt;T&gt; {
  if (v == null) throw new Error(msg)
}

assertDefined(user)
user.email      <span class="c">// narrowed from User | null to User, no cast</span>`}],
a:`<p>The danger to name out loud: a predicate is an <em>assertion you are making</em>, not a check the compiler performs. If <code>isCat</code> returns true for a dog, TypeScript believes it and you get a runtime crash with a green build. That is why schema validation at real boundaries beats hand-written guards.</p>`,
fu:['How does that differ from a cast?','Where do you validate — the guard or a schema library?']
},
{
q:'Explain <code>satisfies</code> and when it beats an annotation.',
test:'Whether you have kept up with the language past 4.x.',
a:`<p>An annotation <em>widens</em> the value to the declared type; <code>satisfies</code> <em>checks</em> the value against the type while keeping the narrow inferred type. You want it whenever you need both the check and the literal precision.</p>`,
code:[{code:`type Config = Record&lt;string, string | number&gt;

const a: Config = { port: 3000, host: 'localhost' }
a.port                       <span class="c">// string | number — precision lost</span>

const b = { port: 3000, host: 'localhost' } satisfies Config
b.port                       <span class="o">// number — checked AND narrow</span>
<span class="c">// and a typo in a key is still an error, which a bare const would not catch</span>`}],
fu:['Where would you use it in a theme or route table?','What is `as const` and how does it interact?']
},
{
q:'What is structural typing, and how does it differ from nominal typing?',
test:'The mental model that explains half of TypeScript\'s surprises.',
a:`<p>TypeScript compares types by <b>shape</b>, not by name. If an object has the required members it is assignable, regardless of what it was declared as. Java and C# are nominal — a name must match.</p>
<p>The practical consequence people get bitten by: two different domain ids are the same type.</p>`,
code:[{code:`type UserId = string
type OrderId = string
function get(id: UserId) {}
get(orderId)                 <span class="c">// compiles. Same shape. Real bug.</span>

<span class="c">// branded types restore nominal behaviour</span>
type UserId  = string &amp; { readonly __brand: 'UserId' }
type OrderId = string &amp; { readonly __brand: 'OrderId' }
get(orderId)                 <span class="o">// now an error</span>`}],
after:`<p>Also worth naming: <b>excess property checking</b> applies only to object literals assigned directly. Assign the literal to a variable first and the check disappears — which is why a stray key sometimes errors and sometimes does not.</p>`,
fu:['Why does assigning a literal error but a variable not?','What is a branded type used for in practice?']
},
{
q:'Rapid-fire TypeScript',
test:'Breadth across the type system.',
a:`<ul>
<li><b><code>keyof</code>, <code>typeof</code>, indexed access.</b> <code>keyof T</code> is the union of keys; <code>typeof x</code> lifts a value into a type; <code>T['id']</code> reads a property's type.</li>
<li><b>Conditional types.</b> <code>T extends U ? A : B</code>. With <code>infer</code> you can pull a type out: <code>type Unwrap&lt;T&gt; = T extends Promise&lt;infer U&gt; ? U : T</code>.</li>
<li><b>Distributive conditionals.</b> A conditional over a naked type parameter distributes across a union — which is how <code>Exclude</code> works.</li>
<li><b><code>as const</code>.</b> Freezes literals and makes arrays readonly tuples. The way to derive a union from a runtime list.</li>
<li><b>Enum vs union of literals.</b> Prefer the union: no runtime object emitted, no reverse-mapping oddities, better narrowing. <code>const enum</code> has its own inlining problems.</li>
<li><b>Declaration files.</b> <code>.d.ts</code> describes the shape of untyped JS. You write one to type a library that ships none, or to declare globals.</li>
<li><b>Strict mode flags that matter.</b> <code>strictNullChecks</code> (the important one), <code>noUncheckedIndexedAccess</code> (makes <code>arr[0]</code> possibly undefined — painful and correct), <code>exactOptionalPropertyTypes</code>.</li>
<li><b>Generics with defaults and constraints.</b> <code>&lt;T extends object = {}&gt;</code>.</li>
<li><b>Variance.</b> Function parameters are checked bivariantly for methods and contravariantly for standalone function types — which is why <code>strictFunctionTypes</code> exists.</li>
<li><b>Utility types worth knowing by name.</b> <code>ReturnType</code>, <code>Parameters</code>, <code>Awaited</code>, <code>NonNullable</code>, <code>Extract</code>, <code>Exclude</code>.</li>
<li><b>Does TypeScript exist at runtime?</b> No. Types are erased at compile time — which is exactly why you still need runtime validation at every boundary.</li>
</ul>`
}
]},
{
id:'r4', code:'R4', navTitle:'React & Next.js',
title:'React & Next.js',
meta:[['Length','45–60 min'],['Who','Frontend lead'],['Decides','Your strongest round — win it decisively'],['Fail mode','Hook rules memorised, rendering model not understood']],
tiers:[['service',1],['product',1],['saas',1],['agency',1]],
intro:'This is where your six years should be loudest. It is also where 2023 answers now get you marked down: the React Compiler is stable, fetch has not cached by default since Next 15, and Next 16 moved to explicit opt-in caching. Answers below are checked against what actually ships in September 2026.',
qs:[
{
q:'What actually happens when state changes? Explain reconciliation.',
test:'Whether you have a model of rendering or just a set of rules.',
a:`<p>A state update schedules a re-render. React calls your component function again, producing a new element tree, and diffs it against the previous one. The diff is <b>heuristic, not optimal</b> — a general tree diff is O(n³), so React makes two assumptions to get O(n):</p>
<ol>
<li>Two elements of different types produce different trees, so it unmounts the old subtree and mounts a new one rather than trying to match across types.</li>
<li>Siblings are matched by <code>key</code>.</li>
</ol>
<p>Then it commits the minimal set of DOM mutations. The crucial sentence: <b>a re-render is not a DOM update.</b> Components re-render constantly; the DOM only changes where the diff found a difference. Candidates who conflate the two end up memoising things that were never touching the DOM anyway.</p>`,
after:`<p>If they push into Fiber: rendering is split into a <b>render phase</b> (interruptible, can be thrown away, must be pure — this is why Strict Mode double-invokes in development) and a <b>commit phase</b> (synchronous, applies the mutations, runs layout effects). That split is what makes concurrent features possible.</p>`,
fu:['Why must the render phase be pure?','What does Strict Mode double-invoking actually catch?','Why does changing an element type remount the whole subtree?']
},
{
q:'Why must keys be stable, and what exactly breaks with index keys?',
test:'The single best question for finding out whether someone understands reconciliation or has memorised a lint warning.',
a:`<p>Keys tell React which element in the new list corresponds to which in the old. With array indices as keys, deleting the first item shifts every subsequent key down by one — so React concludes that every item's <em>content</em> changed, rather than that one item was removed.</p>
<p>What actually breaks is anything not in props: uncontrolled input values, focus, scroll position inside the row, CSS transitions, and component-local state. They follow the <em>position</em> instead of the <em>data</em>.</p>`,
code:[{code:`<span class="c">// delete row 0 and the typed values shift up by one</span>
{rows.map((r, i) =&gt; &lt;input key={i} defaultValue={r.name} /&gt;)}

<span class="c">// stable identity — state follows the row it belongs to</span>
{rows.map(r =&gt; &lt;input key={r.id} defaultValue={r.name} /&gt;)}`}],
after:`<p>Index keys are safe for a list that is never reordered, filtered, sorted or spliced — an append-only log, for instance. Say that qualification; a blanket "never use index keys" sounds memorised.</p>
<p>The inverse trick worth knowing: you can <em>deliberately</em> change a key to force a remount and reset state — <code>&lt;Form key={userId} /&gt;</code> is the idiomatic way to clear a form when the selected user changes.</p>`,
fu:['How would you reset a form when the selected item changes?','What if your data genuinely has no id?','Is Math.random() as a key ever acceptable?']
},
{
q:'<code>useMemo</code>, <code>useCallback</code>, <code>React.memo</code> — when do they help and when are they noise?',
test:'Whether you cargo-cult optimisation. In 2026 there is a second layer: whether you know the compiler changed the answer.',
a:`<p>Classically, all three help in exactly three situations: an expensive computation on every render; a value or callback passed to a memoised child, where a fresh identity would defeat the memo; and a value in a dependency array, where a new identity would re-fire an effect. Everywhere else they cost more than they save — each adds a comparison and holds a reference alive.</p>`,
note:`<p><b>The React Compiler reached 1.0 and is stable in Next.js 16.</b> It memoises automatically at build time by analysing your components, which removes most hand-written <code>useMemo</code> and <code>useCallback</code>. The correct 2026 answer is: <em>"on a new codebase I turn the compiler on and stop writing manual memoisation; it does a better and more consistent job than I do. Manual memo remains for the cases the compiler cannot see — values crossing a context boundary, or an expensive computation it cannot prove is pure. And the compiler only works if the code follows the Rules of React, so it is also a forcing function for cleaning up mutation during render."</em> Saying this shows you are current; saying "I memoise everything" now reads as three years out of date.</p>`,
say:`<p>I do not memoise by default. On the projects I own we turn the React Compiler on and let it handle it; before that, I memoised after seeing a problem in the profiler, not before. The three cases I would still reach for it by hand are an expensive pure computation, a value going into a context provider, and something in a dependency array whose identity is re-firing an effect.</p>`,
trap:`<p>"I wrap everything in useCallback for performance." This is the answer they hear most and it is wrong in both directions — it adds cost, and it does nothing at all unless the child is memoised.</p>`,
fu:['What does React.memo compare, and how do you customise it?','Why does useCallback do nothing if the child is not memoised?','What are the Rules of React the compiler depends on?']
},
{
q:'Explain <code>useEffect</code>. What is the most common bug?',
test:'Effects are where most React bugs live. They want the stale closure and the missing cleanup.',
a:`<p>It runs after the render is committed to the DOM. The dependency array controls re-running; the returned function runs before the next run and on unmount.</p>
<p><b>Bug one: the stale closure.</b> The effect captures state from the render it was created in and then reads that stale value later — classically inside a <code>setInterval</code>.</p>`,
code:[{label:'stale — always logs 0',code:`useEffect(() =&gt; {
  const id = setInterval(() =&gt; setCount(count + 1), 1000)
  return () =&gt; clearInterval(id)
}, [])                          <span class="c">// count is frozen at its first-render value</span>`},{label:'two correct fixes',code:`<span class="c">// functional updater — no dependency on the current value at all</span>
setCount(c =&gt; c + 1)

<span class="c">// or a ref holding the latest value, when you need to READ it</span>
const latest = useRef(count)
useEffect(() =&gt; { latest.current = count })`},{label:'the fetch race, fixed',code:`useEffect(() =&gt; {
  const ac = new AbortController()
  fetch(\`/api/users/\${id}\`, { signal: ac.signal })
    .then(r =&gt; r.json()).then(setUser)
    .catch(e =&gt; { if (e.name !== 'AbortError') setError(e) })
  return () =&gt; ac.abort()        <span class="o">// stale request cancelled on id change</span>
}, [id])`}],
after:`<p><b>Bug two: no cleanup.</b> A subscription or an in-flight request that outlives the component — a resolved response calls <code>setState</code> after unmount, or a slower earlier request overwrites a faster later one (the race that shows the wrong user's data).</p>`,
note:`<p>React 18+ Strict Mode mounts, unmounts and remounts every effect in development precisely to surface these missing cleanups. That is a feature, not a bug — and saying so is a small credibility marker.</p>
<p>The modern framing to add: <em>"most effects I see should not be effects at all. Deriving state from props, transforming data for render, or reacting to a user event are all things that belong in render or in the handler. I use effects for genuine synchronisation with something outside React."</em></p>`,
fu:['When should you NOT use an effect?','How do you fetch data in React today? (A query library or the framework, not raw useEffect.)','What is useLayoutEffect for?']
},
{
q:'You migrated Redux to Zustand. Defend that to someone who disagrees.',
test:'This is on your resume, so it will be asked. They are testing whether you can name what you gave up.',
say:`<p>The trigger was a measured cost, not a preference. With Redux Toolkit every piece of state touched a slice file, an action, a selector and often a thunk — four places to change for one feature, which is where the roughly half of state code that was ceremony came from. Zustand collapsed that into one store hook with a selector, so a feature that took four files took one.</p>
<p>Two things I gave up, and I want to be straight about them. We lost Redux DevTools time-travel debugging, which we had genuinely used to track down a payments bug — I mitigated that with Zustand's devtools middleware, but it is not the same. And we lost the enforced discipline that stops a team putting logic in the wrong layer; I replaced that with a single store directory and a review rule, which is weaker.</p>
<p>If I were starting a system with a large team and heavy derived state, I would still pick Redux Toolkit. For four applications and a small team, the ceremony was not paying for itself.</p>`,
a:`<p>That answer wins because it names the losses. A candidate who claims a migration had no downside gets marked down every time — the interviewer's job is to find out whether you evaluate or evangelise.</p>
<p>Be ready for the technical follow-up on <em>why</em> Zustand re-renders less than Context: it uses an external store with selector-based subscriptions (<code>useSyncExternalStore</code> underneath), so a component re-renders only when the slice it selected changes. Context has no selector — every consumer re-renders when the value changes.</p>`,
fu:['Why not just use Context?','How does Zustand avoid re-rendering every consumer?','What would make you go back to Redux?']
},
{
q:'What is Context for, and why is it not a state manager?',
test:'A specific, common architectural mistake.',
a:`<p>Context solves <b>prop drilling</b> — it is dependency injection for the tree. It does not solve <b>rendering</b>: every consumer re-renders when the provider's value changes, with no way to subscribe to a slice of it. Put a frequently-changing object near the root and you re-render half the application.</p>
<p>Three mitigations, in order of preference:</p>
<ol>
<li>Split into several contexts by change frequency — a rarely-changing <code>ThemeContext</code> and a frequently-changing <code>CartContext</code> should not be one object.</li>
<li>Memoise the provider value, otherwise a new object literal every render invalidates every consumer regardless.</li>
<li>For genuinely shared mutable state, use an external store with selectors — which is the actual argument for Zustand in your migration story.</li>
</ol>`,
code:[{code:`<span class="c">// every consumer re-renders on every parent render — new object each time</span>
&lt;Ctx.Provider value={{ user, setUser }}&gt;

<span class="c">// stable identity</span>
const value = useMemo(() =&gt; ({ user, setUser }), [user])
&lt;Ctx.Provider value={value}&gt;`}],
fu:['How would you subscribe to only part of a context?','Does the compiler fix the provider-value problem? (It helps, but splitting contexts is still the real fix.)']
},
{
q:'Controlled vs uncontrolled components. Which do you reach for?',
test:'Form performance — and whether you know why React Hook Form is fast.',
a:`<p><b>Controlled</b>: React state is the source of truth, every keystroke is a render. <b>Uncontrolled</b>: the DOM holds the value and you read it via a ref on submit.</p>
<p>Controlled for live validation, dependent fields, and input formatting. Uncontrolled for large forms where per-keystroke renders cost you — which is exactly why React Hook Form is uncontrolled underneath and outperforms Formik on big forms. Naming that connection is the answer.</p>`,
code:[{code:`<span class="c">// controlled — re-renders the form on every keypress</span>
&lt;input value={v} onChange={e =&gt; setV(e.target.value)} /&gt;

<span class="c">// uncontrolled — zero renders while typing</span>
&lt;input defaultValue={v} ref={ref} /&gt;`}],
fu:['How do you validate an uncontrolled form?','What warning do you get when a component flips between the two?']
},
{
q:'Explain the four rendering strategies in Next.js and how you choose.',
test:'Directly relevant to your Shopyvilla work. They will connect it to your 40% claim.',
a:`<div class="table-scroll"><table>
<thead><tr><th>Strategy</th><th>Rendered</th><th>Right for</th></tr></thead>
<tbody>
<tr><td>Static (SSG)</td><td>Build time</td><td>Marketing, docs — identical for everyone. Fastest and cheapest.</td></tr>
<tr><td>ISR</td><td>Build time, revalidated on a schedule or on demand</td><td>Catalogue and product pages that change hourly, not per request. Your commerce work.</td></tr>
<tr><td>Server (SSR)</td><td>Per request</td><td>Personalised or auth-gated pages; search results that depend on query params.</td></tr>
<tr><td>Client (CSR)</td><td>In the browser</td><td>Dashboards behind a login where SEO is irrelevant and data is user-specific.</td></tr>
</tbody></table></div>`,
say:`<p>On Shopyvilla, fifteen category and product pages were client-rendered, so crawlers got an empty shell and users got a spinner. Moving them to server rendering with incremental regeneration cut initial load by about forty percent and made the catalogue actually indexable — the organic visibility was the point and the speed was the side effect.</p>`,
fu:['How do you choose the revalidate window?','What happens on the very first request after a deploy with ISR?','How would you handle a page that is 90% static and 10% personalised?']
},
{
q:'How does caching work in the App Router?',
test:'The highest-value Next.js question in 2026, because the answer changed twice and most candidates are still on the old one.',
a:`<p>There are four layers, and knowing there are four is most of the answer:</p>
<ol>
<li><b>Request memoisation</b> — dedupes identical <code>fetch</code> calls within a single render pass, so three components asking for the same user cause one request. For non-fetch data access, React's <code>cache()</code> does the same.</li>
<li><b>Data Cache</b> — persistent across requests and deploys, controlled per fetch.</li>
<li><b>Full Route Cache</b> — the rendered HTML and RSC payload for static routes.</li>
<li><b>Router Cache</b> — client-side, holds visited segments for back/forward navigation.</li>
</ol>`,
note:`<p><b>This is the part that changed.</b> In Next 14, <code>fetch</code> was cached indefinitely by default and you opted out. <b>Since Next 15 the default flipped: <code>fetch</code> is not cached, and you opt in</b> with <code>{ cache: 'force-cache' }</code> or <code>{ next: { revalidate: n } }</code>. The client Router Cache for dynamic routes also went to 0 by default. Next 16 goes further with <b>Cache Components</b> and the <code>'use cache'</code> directive, where caching is explicit and annotated at the page, component or function level, with <code>cacheLife()</code> profiles and <code>cacheTag()</code> for invalidation. Saying "Next caches fetch by default" in an interview today marks you as two major versions behind.</p>`,
code:[{label:'current model — opt in explicitly',code:`<span class="c">// not cached (the default since 15)</span>
await fetch(url)

<span class="c">// cached until revalidated</span>
await fetch(url, { cache: 'force-cache' })

<span class="c">// time-based</span>
await fetch(url, { next: { revalidate: 3600, tags: ['products'] } })

<span class="c">// non-fetch data (an ORM query)</span>
const getUser = cache(async (id) =&gt; db.user.findUnique({ where: { id } }))`},
{label:'Next 16 — use cache',code:`'use cache'
import { cacheLife, cacheTag } from 'next/cache'

export async function getProducts() {
  'use cache'
  cacheLife('hours')
  cacheTag('products')
  return db.product.findMany()
}

<span class="c">// invalidate after a write, from a Server Action or route handler</span>
revalidateTag('products')`}],
fu:['How do you invalidate after a mutation?','What is the difference between revalidatePath and revalidateTag?','Why did the default change?']
},
{
q:'Server Components — what can they not do, and what is the mental model?',
test:'Whether you have shipped the App Router or only read about it.',
a:`<p>They run only on the server, never ship their code to the browser, and can <code>await</code> data directly. That means: no <code>useState</code>, no <code>useEffect</code>, no event handlers, no browser APIs, no class components.</p>
<p>The model: <b>server components are the default; push <code>'use client'</code> as far down the tree as you can</b>, so interactivity is a set of islands rather than the whole page. A <code>'use client'</code> at the top of a layout drags everything below it into the client bundle, which is the most common way teams accidentally lose the entire benefit.</p>
<p>Two gotchas worth naming unprompted:</p>
<ul>
<li>Props crossing the server→client boundary must be <b>serialisable</b> — no functions, no class instances, no Dates in older versions. This is the error people hit first.</li>
<li>A client component <em>can</em> render a server component, as long as it arrives as <code>children</code> rather than being imported. That is the escape hatch for wrapping server content in a client provider.</li>
</ul>`,
code:[{code:`<span class="c">// this does NOT pull Feed into the client bundle</span>
&lt;ClientProvider&gt;
  &lt;ServerFeed /&gt;      <span class="o">// passed as children from a server parent</span>
&lt;/ClientProvider&gt;

<span class="c">// this DOES — an import inside a client file is a client import</span>
'use client'
import ServerFeed from './server-feed'   <span class="c">// no longer a server component</span>`}],
fu:['How do you share state between two client islands?','Where does a context provider go in an App Router app?','What is the RSC payload?']
},
{
q:'What are Server Actions, and how do they change form handling?',
test:'Modern React data mutation. Increasingly the standard question at product companies.',
a:`<p>A Server Action is a function marked <code>'use server'</code> that runs on the server but can be called directly from client code or wired to a <code>&lt;form action&gt;</code>. Next creates the endpoint for you; you never write the fetch, the route or the serialisation.</p>
<p>The genuinely useful property is <b>progressive enhancement</b>: a form with a server action submits and works before JavaScript has loaded, because it is still an HTML form post.</p>`,
code:[{code:`<span class="c">// app/actions.ts</span>
'use server'
export async function createBooking(prev, formData) {
  const parsed = BookingSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Check the dates' }
  await db.booking.create({ data: parsed.data })
  revalidateTag('bookings')
  return { ok: true }
}

<span class="c">// the form — React 19 hooks</span>
'use client'
const [state, action, pending] = useActionState(createBooking, null)
return (
  &lt;form action={action}&gt;
    &lt;input name="date" /&gt;
    &lt;button disabled={pending}&gt;{pending ? 'Booking…' : 'Book'}&lt;/button&gt;
    {state?.error &amp;&amp; &lt;p role="alert"&gt;{state.error}&lt;/p&gt;}
  &lt;/form&gt;
)`}],
note:`<p>The security sentence that scores: <em>"a Server Action is a public HTTP endpoint. Marking it <code>'use server'</code> does not authenticate it — I still validate the input with a schema and check the session inside the action, exactly as I would in a controller."</em> A lot of candidates assume the boundary protects them. It does not.</p>`,
fu:['How do you show optimistic UI with one? (useOptimistic.)','Can you call a Server Action outside a form?','How do you rate-limit one?']
},
{
q:'What did React 19 actually add that you use?',
test:'Whether you track the ecosystem or ship on whatever was current when you learned it.',
a:`<ul>
<li><b>Actions and <code>useActionState</code></b> — pending state, errors and optimistic updates for async mutations, without hand-rolled <code>isLoading</code> booleans.</li>
<li><b><code>useOptimistic</code></b> — show the result immediately, reconcile when the server answers, roll back on failure.</li>
<li><b><code>useFormStatus</code></b> — a nested button can read its parent form's pending state without prop drilling.</li>
<li><b><code>use()</code></b> — read a promise or a context conditionally, unlike a hook. Lets you unwrap a promise passed down from a server component.</li>
<li><b><code>ref</code> as a prop</b> — <code>forwardRef</code> is no longer needed for function components. Large amounts of boilerplate deleted.</li>
<li><b><code>&lt;Context&gt;</code> as a provider</b> — <code>&lt;Ctx&gt;</code> instead of <code>&lt;Ctx.Provider&gt;</code>.</li>
<li><b>Document metadata and resource hints</b> — <code>&lt;title&gt;</code>, <code>&lt;meta&gt;</code>, <code>preload</code> hoisted automatically from anywhere in the tree.</li>
<li><b>Better error messages</b> for hydration mismatches — a genuine day-to-day improvement.</li>
</ul>`,
code:[{label:'useOptimistic — the one they will ask you to demo',code:`const [optimistic, addOptimistic] = useOptimistic(
  messages,
  (state, newMsg) =&gt; [...state, { ...newMsg, sending: true }]
)

async function send(formData) {
  const text = formData.get('text')
  addOptimistic({ text })        <span class="o">// paints instantly</span>
  await sendMessage(text)        <span class="c">// reverts automatically if this throws</span>
}`}],
fu:['How does useOptimistic roll back?','What is the difference between use() and useContext()?']
},
{
q:'What is hydration, and what causes a mismatch?',
test:'SSR debugging. Everyone has hit this; not everyone can explain it.',
a:`<p>The server sends HTML; React then attaches event listeners and builds its internal tree over that existing markup rather than recreating it. A <b>mismatch</b> is when the tree React builds on the client differs from the HTML the server sent.</p>
<p>The causes, in the order you will actually meet them:</p>
<ul>
<li><code>Date.now()</code>, <code>new Date()</code> formatting, <code>Math.random()</code> — different value on each side.</li>
<li>Reading <code>window</code>, <code>localStorage</code>, <code>navigator</code> or a media query during render.</li>
<li>Locale or timezone differences between server and browser.</li>
<li>Invalid HTML nesting — a <code>&lt;div&gt;</code> inside a <code>&lt;p&gt;</code>, which the browser silently restructures so the DOM no longer matches what React sent.</li>
<li>Browser extensions injecting attributes.</li>
</ul>`,
code:[{label:'the correct pattern for genuinely client-only values',code:`const [mounted, setMounted] = useState(false)
useEffect(() =&gt; setMounted(true), [])
if (!mounted) return &lt;Skeleton /&gt;      <span class="c">// server and first client render agree</span>
return &lt;LocalTime value={ts} /&gt;

<span class="c">// or, for a single unavoidable node:</span>
&lt;time suppressHydrationWarning&gt;{new Date().toLocaleString()}&lt;/time&gt;`}],
trap:`<p>Reaching for <code>suppressHydrationWarning</code> across a whole subtree. It silences the warning without fixing the divergence, and the interactive result is then genuinely wrong. It is a scalpel for one text node, not a bandage.</p>`,
fu:['How would you render a theme from localStorage without a flash?','Why does invalid nesting cause this?']
},
{
q:'You cut page load 35%. Take me through exactly what you measured.',
test:'The highest-risk question in your entire loop. Every number on your resume is a claim until you can source it.',
a:`<p>Answer in four beats — measured, diagnosed, changed, verified:</p>
<ul>
<li><b>Measured.</b> Name the metric and the tool. Lighthouse LCP on the three heaviest routes, plus server-side p95 on the endpoints those routes call. Give the before number if you have it.</li>
<li><b>Diagnosed.</b> The heavy routes made the same expensive read on every request — listing and category data that changed a few times a day. The database was repeating identical work.</li>
<li><b>Changed.</b> Redis cache-aside in front of those endpoints, plus the Redux→Zustand move which cut the JavaScript the client had to parse before hydration.</li>
<li><b>Verified.</b> Same Lighthouse runs, same routes, plus cache hit ratio from Redis <code>INFO</code>.</li>
</ul>`,
say:`<p>The honest caveat is that these were lab measurements on specific routes rather than field data from real users — we did not have real-user monitoring in place. If I did it again I would put RUM in first, because lab numbers and field numbers diverge, and I would rather quote a p75 LCP from actual traffic.</p>`,
after:`<p>Volunteering that limitation makes every other number on your resume <em>more</em> credible, not less. Interviewers are calibrating how much of what you say they can trust; a candidate who marks their own uncertainty gets trusted on everything else.</p>`,
fu:['Which specific change contributed most?','What is LCP and what usually causes a bad one?','What would you optimise next?']
},
{
q:'Name the Core Web Vitals and what causes a bad score on each.',
test:'Whether the performance work on your resume came with understanding.',
a:`<div class="table-scroll"><table>
<thead><tr><th>Metric</th><th>Good</th><th>Usual cause when bad</th></tr></thead>
<tbody>
<tr><td><b>LCP</b> largest contentful paint</td><td class="n">&lt; 2.5s</td><td>A huge unoptimised hero image, a slow server response, or render-blocking CSS/fonts.</td></tr>
<tr><td><b>INP</b> interaction to next paint</td><td class="n">&lt; 200ms</td><td>Long tasks on the main thread — heavy re-renders, big JSON parses, unmemoised expensive work in a handler. <em>Replaced FID in 2024.</em></td></tr>
<tr><td><b>CLS</b> cumulative layout shift</td><td class="n">&lt; 0.1</td><td>Images without dimensions, ads or banners injected above content, and web fonts swapping at a different size.</td></tr>
</tbody></table></div>
<p>Fixes worth naming: <code>next/image</code> with explicit sizing (it reserves the box, which is most of CLS), <code>font-display: swap</code> with a metric-matched fallback, preloading the LCP image, and code-splitting to shorten long tasks.</p>`,
note:`<p>Mentioning <b>INP</b> rather than FID is a small currency check — FID was retired in 2024 and candidates still naming it are quoting old material.</p>`,
fu:['How would you measure these on real users rather than in Lighthouse?','What is a long task?','How does next/image prevent layout shift?']
},
{
q:'Rapid-fire React & Next.js',
test:'Breadth. Expect fifteen of these in a services round.',
a:`<ul>
<li><b>Rules of hooks and why.</b> Hooks are matched by call order across renders; a conditional hook desynchronises the list and state lands on the wrong hook.</li>
<li><b><code>useRef</code> vs <code>useState</code>.</b> Both persist across renders; only state triggers one. Refs for DOM nodes, timer ids, and "latest value" reads.</li>
<li><b><code>useLayoutEffect</code>.</b> Runs synchronously after DOM mutation, before paint. For measuring an element and adjusting it without a visible flicker. It blocks paint, so use it sparingly — and it does not run on the server.</li>
<li><b>Custom hooks.</b> A function starting with <code>use</code> that calls other hooks. A good one has a single responsibility and returns a stable API.</li>
<li><b><code>React.lazy</code> + <code>Suspense</code>.</b> Split at route boundaries first, then at heavy below-the-fold components (a chart library, a rich text editor).</li>
<li><b>Error boundaries.</b> Catch errors during rendering, in lifecycles and in constructors. They cannot catch errors in event handlers, async code, or on the server during SSR — those need try/catch.</li>
<li><b>Virtualising 50,000 rows.</b> Render only the visible window plus an overscan buffer; <code>react-window</code> or TanStack Virtual. The hard part is variable row heights.</li>
<li><b><code>useTransition</code>.</b> Marks an update as non-urgent so typing stays responsive while an expensive list re-filters. <code>useDeferredValue</code> is the value-shaped version.</li>
<li><b>Middleware in Next.</b> Runs before a request completes, at the edge. Auth redirects, locale routing, A/B bucketing. Keep it thin — it is on every request.</li>
<li><b>Route handlers.</b> <code>app/api/x/route.ts</code> exporting <code>GET</code>/<code>POST</code>. They take and return standard Web <code>Request</code>/<code>Response</code>, unlike the old <code>req</code>/<code>res</code> API routes.</li>
<li><b>Auth in the App Router.</b> Session check in a server component or middleware; never trust a client-side guard, because the data fetch is what actually needs protecting.</li>
<li><b><code>loading.tsx</code> and <code>error.tsx</code>.</b> File conventions that wrap a segment in Suspense and an error boundary automatically.</li>
<li><b>Parallel and intercepting routes.</b> Slot-based layouts and the "open a photo in a modal but deep-link to the full page" pattern.</li>
<li><b>How do you test a component?</b> React Testing Library, asserting on what a user sees and does — roles and text, not class names. Do not test implementation details or internal state.</li>
<li><b>WCAG 2.1 AA — name four things you actually did.</b> Semantic landmarks and heading order; focus management on route change; contrast ratios of 4.5:1 for text; labels on every control with ARIA only where semantics ran out; no keyboard traps in modals.</li>
</ul>`
}
]},
{
id:'r5', code:'R5', navTitle:'Node & NestJS',
title:'Node, NestJS & API design',
meta:[['Length','45–60 min'],['Who','Backend lead or architect'],['Decides','Whether "full stack" is half true'],['Fail mode','Framework syntax without runtime understanding']],
tiers:[['service',1],['product',1],['saas',1],['agency',0]],
intro:'Your resume claims six domain services and ownership of the API standards. That claim raises the bar in this round rather than lowering it — they will not ask what a controller is, they will ask why you did not put a queue behind it.',
qs:[
{
q:'Node is single-threaded. How does it serve thousands of concurrent requests?',
test:'The foundational Node question. They want the I/O offload and, crucially, what breaks it.',
a:`<p>Your JavaScript runs on one thread, but I/O does not. Network and file operations are handed to the operating system (via epoll/kqueue) or to libuv's thread pool, and your callback is queued when they complete. So thousands of connections can be in flight while the single thread sits idle waiting.</p>
<p>The corollary is the actual point, and it is what they are listening for: <b>CPU work blocks everything.</b> A synchronous parse of a 50MB JSON payload, a bcrypt round, an image resize, a big <code>JSON.stringify</code> — each one stops every other request on that process for its whole duration.</p>`,
code:[{code:`<span class="c">// this stalls every concurrent request for ~200ms</span>
app.get('/hash', (req, res) =&gt; {
  const h = bcrypt.hashSync(req.body.pw, 12)   <span class="c">// sync = blocking</span>
  res.json({ h })
})

<span class="c">// fixes, in order of preference:</span>
<span class="c">// 1. use the async API — bcrypt.hash offloads to the libuv thread pool</span>
<span class="c">// 2. worker_threads for genuine CPU work you own</span>
<span class="c">// 3. push it to a queue and answer 202 Accepted</span>
<span class="c">// 4. cluster / PM2 to use all cores — helps throughput, not one slow request</span>`}],
after:`<p>Detail that shows depth: the libuv thread pool defaults to <b>four</b> threads and is shared by file I/O, DNS lookups, zlib and crypto. Four concurrent <code>bcrypt</code> calls saturate it, and the fifth waits — a real and frequently misdiagnosed production stall. <code>UV_THREADPOOL_SIZE</code> raises it.</p>`,
fu:['How would you detect that in production? (Event loop lag metric.)','What does worker_threads share with the main thread?','Does clustering help a single slow request?']
},
{
q:'Walk me through the layers of a NestJS request.',
test:'Whether your architecture claims come with knowing where things go.',
a:`<p>In order: <b>middleware → guards → interceptors (before) → pipes → handler → interceptors (after) → exception filters</b> wrapping the whole thing.</p>
<p>Reciting the order is half the marks. The other half is naming what you actually put in each:</p>
<div class="table-scroll"><table>
<thead><tr><th>Layer</th><th>What belongs there</th></tr></thead>
<tbody>
<tr><td>Middleware</td><td>Request id generation, raw body capture for webhook signatures, correlation headers.</td></tr>
<tr><td>Guards</td><td>Authentication and authorisation — anything that answers "may this request proceed?". Has access to the execution context, so it can read roles from a decorator.</td></tr>
<tr><td>Interceptors</td><td>Cross-cutting concerns around the handler: logging, timing, response shaping, caching, timeouts. They can transform the return value.</td></tr>
<tr><td>Pipes</td><td>Validation and transformation of inputs. <code>ValidationPipe</code>, <code>ParseUUIDPipe</code>.</td></tr>
<tr><td>Filters</td><td>Turning thrown domain exceptions into HTTP responses with a consistent shape.</td></tr>
</tbody></table></div>
<p>The distinction they probe: <b>a guard decides, an interceptor wraps, a pipe transforms.</b> If you can only put one thing in the wrong place it is usually auth in middleware — which works, but loses you the execution context and the decorator metadata.</p>`,
fu:['Where would you put rate limiting?','How does a guard read a @Roles() decorator?','What is an execution context?']
},
{
q:'You mention typed DTO validation at every boundary. Show me.',
test:'Whether the phrase on your resume corresponds to a configuration you can reproduce.',
code:[{code:`export class CreateBookingDto {
  @IsUUID() campId: string
  @IsISO8601() startsAt: string
  @IsInt() @Min(1) @Max(10) seats: number
}

@Post()
create(@Body() dto: CreateBookingDto) { return this.svc.create(dto) }`},
{label:'the global pipe — this is where the marks are',code:`app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              <span class="o">// strip properties with no decorator</span>
  forbidNonWhitelisted: true,   <span class="o">// or reject the request outright</span>
  transform: true,              <span class="c">// give the handler a real class instance</span>
  transformOptions: { enableImplicitConversion: true },
}))`}],
a:`<p>The security value is <code>whitelist</code>, not the type safety. Without it, a client can post <code>{ seats: 2, isAdmin: true }</code> and that extra property travels into your service and potentially into an ORM <code>create</code> — this is mass assignment, and it is the actual reason the flag exists. Say that; most candidates only mention type safety.</p>
<p><code>transform: true</code> matters too: without it your "DTO" is a plain object that merely satisfies the shape, so <code>instanceof</code> checks and class methods silently do not work.</p>`,
note:`<p>The 2026 alternative worth naming: many teams have moved to <b>Zod</b> with a custom validation pipe, because it gives one schema that produces both the runtime check and the TypeScript type via <code>z.infer</code>, rather than keeping decorators and types in sync by hand. Mentioning that you know both and why you would choose either is a strong answer.</p>`,
fu:['How do you validate query params and route params?','How do you return a useful error shape from a failed validation?','What is mass assignment?']
},
{
q:'Six services and no message broker. Why not?',
test:'The most likely architectural challenge in your entire loop. They read "6 domain services" and want to know if you understand what you built.',
say:`<p>I want to be precise about the word, because it gets overloaded: they are domain modules inside a deployment that shares infrastructure, not six independently deployed services with independent failure domains. Communication is synchronous, and at our volume that was the right call — a broker is infrastructure you have to run, monitor, secure and reason about, and at five thousand users with sub-two-hundred-millisecond responses it would have bought us nothing measurable.</p>
<p>The specific point at which I would add one is notifications. Today a booking confirmation sends email inline, so a slow SMTP provider adds latency to the user's request, and a failure there can fail a booking that actually succeeded — the write is committed but the user sees an error. That is a queue-shaped problem. I would put BullMQ on Redis in first because we already run Redis, and only reach for Kafka if we needed event replay, ordered partitions, or several independent consumers of the same stream.</p>`,
a:`<p>This turns your biggest architectural gap into evidence of judgement. Learn the shape of it: <em>name the tradeoff honestly → give the specific trigger that would change the decision → name the tool and why that tool</em>.</p>`,
after:`<p>Know the difference if they push: a <b>queue</b> (BullMQ, SQS, RabbitMQ) delivers each job to one consumer and is about work distribution. A <b>log</b> (Kafka) retains an ordered stream that many independent consumers read at their own offset, and is about event history. Choosing Kafka for background jobs is over-engineering; choosing a queue when you need replay is under-engineering.</p>`,
fu:['What happens if the queue worker crashes mid-job?','What is a dead letter queue?','How do you make a job idempotent?']
},
{
q:'Design a REST API for booking a slot. Talk me through the contract.',
test:'API design is on your resume as a standard you authored. This is the audit.',
code:[{code:`GET    /camps?location=&amp;ageMin=&amp;priceMax=&amp;cursor=&amp;limit=
GET    /camps/:id
GET    /camps/:id/slots?from=&amp;to=
POST   /bookings          { campId, slotId, seats }   → 201 + Location
GET    /bookings/:id
DELETE /bookings/:id                                  → 204`},{label:'the error envelope worth having an opinion about',code:`{
  "error": {
    "code": "SLOT_UNAVAILABLE",       <span class="c">// stable, machine-readable</span>
    "message": "That slot is full.",  <span class="c">// human, safe to display</span>
    "details": [{ "field": "slotId", "issue": "no_capacity" }],
    "requestId": "01J8X…"             <span class="o">// the thing that makes support possible</span>
  }
}`}],
a:`<p>Resources as nouns, verbs as HTTP methods, hierarchy where it means containment. That gets you a pass. The senior details are what actually get scored:</p>
<ul>
<li><b>Status codes that mean something.</b> 400 malformed, 401 not authenticated, 403 authenticated but not allowed, 404 not found, <b>409</b> the slot is already taken, <b>422</b> well-formed but semantically impossible, 429 rate limited.</li>
<li><b>Idempotency.</b> <code>POST /bookings</code> takes an <code>Idempotency-Key</code> header so a client retry after a timeout returns the original booking instead of creating a second one. Store the key with the response for 24 hours.</li>
<li><b>Cursor pagination</b>, not offset — offset drifts when rows are inserted, and <code>OFFSET 100000</code> makes the database count through everything.</li>
<li><b>One error envelope</b> everywhere, so clients write error handling once.</li>
<li><b>Versioning</b> via <code>/v1</code> or a header, decided before the first external consumer exists.</li>
<li><b>Filtering as query params</b>, not a proliferation of endpoints like <code>/camps/by-location/:x</code>.</li>
</ul>`,
fu:['How would you version this without breaking clients?','Why cursor over offset?','What is HATEOAS and do you use it? (Honest answer: no, and say why.)']
},
{
q:'Two users book the last seat at the same moment. What happens?',
test:'Concurrency. This is where most full-stack candidates fall apart, and it is directly on your booking-marketplace resume.',
a:`<p>A read-then-write without protection double-books, because both transactions read "one seat left" before either writes. Four defences — name the tradeoffs, do not just list them:</p>`,
code:[{label:'1. atomic conditional update — simplest correct fix',code:`UPDATE slots
   SET remaining = remaining - 1
 WHERE id = $1 AND remaining &gt; 0;
<span class="c">-- affected rows = 0 means someone beat you → return 409</span>
<span class="c">-- one statement, no lock held across a round trip</span>`},
{label:'2. database constraint — the one that survives a logic bug',code:`CREATE UNIQUE INDEX ON bookings (slot_id, seat_no);
<span class="c">-- catch the violation, return 409. Holds even if the app is wrong.</span>`},
{label:'3. pessimistic lock',code:`BEGIN;
SELECT * FROM slots WHERE id = $1 FOR UPDATE;   <span class="c">-- serialises this row</span>
<span class="c">-- ... check and insert ...</span>
COMMIT;
<span class="c">-- correct and simple, but throughput on a hot row drops and</span>
<span class="c">-- inconsistent lock ordering across transactions deadlocks</span>`},
{label:'4. optimistic lock — best under low contention',code:`UPDATE slots SET remaining = remaining - 1, version = version + 1
 WHERE id = $1 AND version = $2;
<span class="c">-- 0 rows → someone else committed first → re-read and retry</span>`}],
after:`<p>Close with the layered answer: <em>"in practice I would use the atomic decrement for the common path and keep the unique constraint as the backstop, because application logic changes and constraints do not."</em> Defence in depth is the senior position.</p>`,
fu:['What if the seat must be held for 10 minutes during payment?','How does this change across two services?','What is a deadlock and how do you avoid one?']
},
{
q:'How do you handle authentication and authorisation?',
test:'Whether you know the failure modes of JWTs, not just how to sign one.',
a:`<p>Short-lived access JWT (10–15 minutes) plus a long-lived refresh token. The refresh token lives in an <code>httpOnly; Secure; SameSite=Strict</code> cookie, is <b>rotated on every use</b>, and the old one is invalidated — with <b>reuse detection</b>, so if a rotated token is presented again you revoke the whole family, because that means it was stolen.</p>
<p>Access tokens carry the user id and roles; a Nest guard verifies the signature and a <code>@Roles()</code> decorator plus a roles guard does authorisation.</p>
<p>Then the sentence that shows you have thought about it rather than copied it:</p>`,
say:`<p>The thing to be honest about with JWTs is that they cannot be revoked. Once signed, that token is valid until it expires — so if a user is banned or logs out, a stateless check will still accept their token. You either keep access-token lifetimes very short and accept a small window, or you keep a denylist in Redis, at which point you have reintroduced the state that JWTs were supposed to remove. On our systems we did short lifetimes plus a Redis denylist for explicit logout, because we already ran Redis.</p>`,
after:`<p>Other details worth having ready: passwords hashed with <b>argon2id</b> or bcrypt (never SHA — it is fast, which is exactly wrong for passwords); <code>localStorage</code> is readable by any XSS so tokens there are a real risk; and if you use cookies you need CSRF protection, which SameSite mostly but not entirely provides.</p>`,
fu:['Where do you store the access token on the client?','What is refresh token rotation and reuse detection?','How would you implement "log out of all devices"?']
},
{
q:'Rate limiting — how would you build it?',
test:'Your resume lists Redis for rate limiting, so this is an audit question.',
a:`<p>Counters in Redis keyed by user id or IP. Three algorithms, and knowing why you would move up the list is the answer:</p>
<ul>
<li><b>Fixed window.</b> <code>INCR key</code> + <code>EXPIRE</code>. Cheap, but allows a burst of double the limit across a window boundary — 100 requests at 11:59:59 and 100 more at 12:00:00.</li>
<li><b>Sliding window log.</b> A sorted set of timestamps; drop anything older than the window with <code>ZREMRANGEBYSCORE</code>, then <code>ZCARD</code>. Exact, but memory grows with request volume.</li>
<li><b>Token bucket.</b> Tokens refill at a fixed rate up to a capacity. Allows a controlled burst, which is usually what you actually want, and needs only two numbers per key.</li>
</ul>`,
code:[{label:'fixed window, done atomically',code:`<span class="c">-- Lua, so the INCR and EXPIRE cannot interleave</span>
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return n`}],
after:`<p>Return <b>429</b> with <code>Retry-After</code>, and the <code>RateLimit-Limit</code> / <code>RateLimit-Remaining</code> / <code>RateLimit-Reset</code> headers so well-behaved clients can back off instead of hammering. And say why it must be in Redis rather than in memory: with more than one instance behind a load balancer, in-process counters give each instance its own limit.</p>`,
fu:['Where do you put the limiter — app, gateway or CDN?','How do you rate limit by user when they are not logged in?','What do you do about a distributed attack from many IPs?']
},
{
q:'What is idempotency, and which HTTP methods are idempotent?',
test:'Whether you design for retries, which is what distributed systems actually are.',
a:`<p>An idempotent operation produces the same result whether applied once or many times. <code>GET</code>, <code>PUT</code> and <code>DELETE</code> are idempotent by specification; <code>POST</code> is not.</p>
<p>Why it matters: a client that times out does not know whether the request succeeded. If it retries a <code>POST /payments</code>, you charge twice. The fix is an idempotency key:</p>`,
code:[{code:`<span class="c">// client sends a UUID it generates once per logical operation</span>
Idempotency-Key: 8f14e45f-…

<span class="c">// server: SETNX the key → if it already exists, return the stored response</span>
const first = await redis.set(\`idem:\${key}\`, 'pending', { NX: true, EX: 86400 })
if (!first) return cachedResponseFor(key)
<span class="c">// ...do the work, then store the response body and status against the key</span>`}],
after:`<p>Also note: idempotent is not the same as safe. <code>DELETE</code> is idempotent (deleting twice leaves the same state) but not safe (it changes state). <code>GET</code> is both.</p>`,
fu:['How long do you keep idempotency keys?','What if the same key arrives with a different body?','Is a webhook handler idempotent?']
},
{
q:'When have you needed a stream?',
test:'Memory awareness. Candidates who have never processed a large file give themselves away here.',
a:`<p>Whenever the data is larger than you want in memory, or you want to start producing output before the input is finished. A 500MB CSV read with <code>fs.readFileSync</code> allocates 500MB; streamed, it holds a 64KB chunk.</p>`,
code:[{code:`import { pipeline } from 'node:stream/promises'

await pipeline(
  fs.createReadStream('big.csv'),
  csvParse(),
  transformRows(),
  fs.createWriteStream('out.ndjson')
)
<span class="c">// pipeline() propagates errors and destroys every stream on failure —</span>
<span class="c">// .pipe() does neither, which is why it leaks file handles</span>`}],
after:`<p><b>Backpressure</b> is the concept they are fishing for: if the destination is slower than the source, the buffer grows without bound and the process runs out of memory. <code>pipe</code>/<code>pipeline</code> handle this by pausing the readable when the writable's internal buffer passes its high-water mark. Doing it by hand with <code>'data'</code> events and ignoring the return value of <code>write()</code> is how people accidentally build a memory leak.</p>`,
fu:['Why pipeline over pipe?','How would you stream a CSV export to a browser?','What is an object-mode stream?']
},
{
q:'How do you handle file uploads at scale?',
test:'Whether you would route hundreds of megabytes through your API process.',
a:`<p>You do not accept the bytes. Issue a <b>presigned S3 URL</b> so the browser uploads directly to storage, and your API only handles metadata:</p>
<ol>
<li>Client asks your API for an upload URL, sending filename, content type and size.</li>
<li>API authorises, generates a presigned <code>PUT</code> URL scoped to one key, with a short expiry and a content-length limit, and records a <code>pending</code> row.</li>
<li>Browser uploads straight to S3.</li>
<li>An S3 event notification triggers a worker that validates, generates thumbnails or extracts text, and flips the row to <code>ready</code>.</li>
</ol>
<p>The benefits to name: your API never holds the file, never blocks on the upload, scales independently of file size, and a failed upload leaves no half-written state in your process.</p>`,
after:`<p>For files over about 100MB, mention <b>multipart upload</b> so a dropped connection resumes rather than restarting. And validate the content type server-side after upload — a client-supplied MIME type is a claim, not a fact.</p>`,
fu:['How do you stop someone uploading a 10GB file?','How does the client know when processing is done?','How do you serve the file back securely?']
},
{
q:'What has to happen on SIGTERM?',
test:'Deployment maturity. A candidate who has never thought about this drops requests on every deploy.',
a:`<p>Graceful shutdown, in this order:</p>
<ol>
<li><b>Stop accepting new work.</b> Fail the readiness probe first so the load balancer stops routing to you, <em>then</em> close the server. Closing first drops requests that are already in flight to you.</li>
<li><b>Finish in-flight requests</b>, with a timeout — typically 10–30 seconds.</li>
<li><b>Drain background workers</b>: stop pulling new jobs, let current ones finish or return them to the queue.</li>
<li><b>Close resources</b>: database pool, Redis, open file handles.</li>
<li><b>Exit 0.</b> If the timeout expires, exit anyway — a process that hangs on shutdown gets SIGKILLed and you lose the graceful part entirely.</li>
</ol>`,
code:[{code:`let shuttingDown = false
app.get('/ready', (_, res) =&gt; res.status(shuttingDown ? 503 : 200).end())

process.on('SIGTERM', async () =&gt; {
  shuttingDown = true                          <span class="o">// LB stops sending traffic</span>
  await sleep(5000)                            <span class="c">// let it notice</span>
  server.close()
  await Promise.race([drain(), sleep(20000)])
  process.exit(0)
})`}],
note:`<p>NestJS has this built in: <code>app.enableShutdownHooks()</code> plus <code>OnModuleDestroy</code> / <code>beforeApplicationShutdown</code> lifecycle hooks. Naming the framework support rather than hand-rolling it is the better answer.</p>`,
fu:['What is the difference between a liveness and a readiness probe?','What happens to a job that was half-processed?']
},
{
q:'Rapid-fire backend',
test:'Breadth across the runtime and the framework.',
a:`<ul>
<li><b>Dependency injection — what does the IoC container buy you?</b> Constructor-injected dependencies you can swap in tests without monkey-patching modules. That testability is the whole point.</li>
<li><b>Provider scopes.</b> Default singleton. <code>REQUEST</code> scope instantiates per request — convenient for request context, but it bubbles up the whole injection chain and costs real throughput. Use an <code>AsyncLocalStorage</code>-based context instead where you can.</li>
<li><b>Circular dependencies.</b> <code>forwardRef</code> works, but it is a smell — usually two modules that should be one, or a shared third module that should own the common code.</li>
<li><b>CORS.</b> A browser-enforced policy, not a server security feature. A preflight <code>OPTIONS</code> fires for non-simple requests (custom headers, <code>PUT</code>/<code>DELETE</code>, JSON content type). CORS does not protect your API — anything not a browser ignores it entirely.</li>
<li><b>Five ways to secure an API.</b> Helmet for headers; validation with whitelisting; rate limiting; parameterised queries or an ORM; secrets out of the repo; dependency audit in CI.</li>
<li><b>SQL injection in Node.</b> String-concatenated queries. The fix is parameterised queries — and note that an ORM's <code>raw()</code> escape hatch reintroduces the risk.</li>
<li><b>REST vs GraphQL vs gRPC.</b> REST for public and simple APIs. GraphQL when many clients need different shapes of the same data and over-fetching is a real cost — accepting the N+1 and caching complexity it brings. gRPC for internal service-to-service where you want a typed contract and binary efficiency.</li>
<li><b>Testing a Nest service.</b> Unit: <code>Test.createTestingModule</code> with mocked providers. E2E: Supertest against the real app with a test database, ideally in a container.</li>
<li><b>Config across five environments.</b> <code>ConfigModule</code> with a Joi or Zod validation schema so the process <b>fails at boot</b> on a missing variable rather than at 3am during a request.</li>
<li><b>Circuit breaker.</b> After N consecutive failures to a dependency, stop calling it and fail fast for a cooldown, then let one probe through. Stops a slow dependency from exhausting your connection pool and taking you down with it.</li>
<li><b>WebSockets vs SSE vs polling.</b> SSE for one-directional server→client updates: simpler, plain HTTP, auto-reconnect. WebSockets when the client also pushes. Polling when neither is worth the operational cost.</li>
<li><b>Correlation ids.</b> Generate one in middleware, put it in <code>AsyncLocalStorage</code>, attach it to every log line and pass it downstream. Without it, debugging across services is guesswork.</li>
<li><b>Node LTS.</b> Node 26 became Active LTS in May 2026; 24 is in its final months of active support; 22 is in maintenance until April 2027. Production runs on an LTS line, never on Current.</li>
</ul>`
}
]},
{
id:'r6', code:'R6', navTitle:'Databases & Redis',
title:'Databases & Redis',
meta:[['Length','20–40 min, often folded into R5'],['Who','Backend lead'],['Decides','Whether you can be trusted with data'],['Fail mode','Knowing an ORM but not SQL']],
tiers:[['service',1],['product',1],['saas',1],['agency',0]],
intro:'The most reliable way to find out whether a full-stack engineer is actually full-stack. An ORM hides everything in this round until someone asks you to read a query plan.',
qs:[
{
q:'A query got slow. Walk me through what you do.',
test:'Method. They want a diagnostic sequence, not a list of things that can be slow.',
a:`<p><code>EXPLAIN ANALYZE</code> first — never guess, and say that. Then read it for four things:</p>
<ol>
<li><b>A sequential scan on a large table</b> where you expected an index scan.</li>
<li><b>A row estimate wildly different from actual</b> — the planner is working from stale statistics, so <code>ANALYZE</code> the table.</li>
<li><b>A nested loop over many rows</b> where a hash join would be right.</li>
<li><b>A sort or hash that spilled to disk</b> — <code>work_mem</code> too small for the query.</li>
</ol>
<p>Then look at the query itself for the usual causes:</p>
<ul>
<li>No index on the filter or join column, or the wrong column order in a composite index.</li>
<li>A function wrapping an indexed column — <code>WHERE LOWER(email) = $1</code> cannot use a plain index on <code>email</code>; it needs a functional index on <code>LOWER(email)</code>.</li>
<li>An implicit type cast doing the same thing — comparing a <code>varchar</code> column to an integer parameter.</li>
<li><code>SELECT *</code> pulling columns nobody uses, defeating a covering index.</li>
<li>An N+1 from the ORM.</li>
<li><code>OFFSET 100000</code>, which makes the database count through 100,000 rows to discard them.</li>
</ul>`,
code:[{code:`EXPLAIN (ANALYZE, BUFFERS)
SELECT b.* FROM bookings b
 WHERE b.user_id = $1 AND b.created_at &gt; now() - interval '30 days'
 ORDER BY b.created_at DESC LIMIT 20;

<span class="c">-- the index this wants:</span>
CREATE INDEX ON bookings (user_id, created_at DESC);
<span class="c">-- equality column first, then the range/sort column</span>`}],
fu:['What does BUFFERS tell you?','How do you find slow queries in the first place? (pg_stat_statements, slow query log.)','When would you NOT add an index?']
},
{
q:'How does a B-tree index work, and why does column order matter?',
test:'The single most useful piece of database knowledge for an application engineer.',
a:`<p>A balanced tree kept sorted by the indexed columns. Logarithmic lookup, and — the part people forget — <b>ordered range scans</b>, which is why the same index that serves <code>WHERE created_at &gt; x</code> also serves <code>ORDER BY created_at</code> without a sort.</p>
<p>A composite index on <code>(a, b)</code> is sorted by <code>a</code> first, then by <code>b</code> within equal values of <code>a</code>. So it serves:</p>`,
code:[{code:`CREATE INDEX ON t (a, b);

WHERE a = 1              <span class="c">-- yes</span>
WHERE a = 1 AND b = 2    <span class="c">-- yes</span>
WHERE a = 1 ORDER BY b   <span class="c">-- yes, no sort needed</span>
WHERE b = 2              <span class="c">-- NO. leftmost-prefix rule.</span>

<span class="c">-- rule of thumb for ordering columns:</span>
<span class="c">-- equality predicates first, then the range/sort column, then included columns</span>`}],
after:`<p>Then the cost side, which is what makes it a senior answer: <b>every index slows every write</b> and consumes storage, because each insert, update and delete must maintain it. An index nobody uses is pure overhead — <code>pg_stat_user_indexes</code> shows you which ones have zero scans.</p>
<p>Also worth naming: a <b>covering index</b> (<code>INCLUDE</code> in Postgres) contains every column the query needs, so it never touches the table at all — an index-only scan. And a <b>partial index</b> (<code>WHERE status = 'pending'</code>) is far smaller when you only ever query a small subset.</p>`,
fu:['What is a covering index?','When is a hash index better than a B-tree?','Why is an index on a low-cardinality column often useless?']
},
{
q:'What is an N+1 query, and how did you catch one?',
test:'The most common ORM performance bug. Catching it is the interesting half.',
a:`<p>One query fetches N parents, then the ORM issues one query per parent to load a relation — 101 round trips instead of two. It never appears locally with ten rows and destroys you at ten thousand.</p>`,
code:[{code:`<span class="c">// N+1</span>
const camps = await repo.find()                 <span class="c">// 1 query</span>
for (const c of camps) c.slots = await slots.findBy({ campId: c.id })  <span class="c">// N</span>

<span class="c">// fix 1 — join</span>
await repo.find({ relations: { slots: true } })

<span class="c">// fix 2 — batch, when a join would multiply rows badly</span>
const all = await slots.findBy({ campId: In(camps.map(c =&gt; c.id)) })
const byCamp = Object.groupBy(all, s =&gt; s.campId)`}],
after:`<p>How you catch it: query logging in development with a per-request count and a threshold that fails a test; or an APM trace that shows the fan-out visually. In GraphQL the standard answer is DataLoader, which batches the per-item resolver calls within a tick.</p>
<p>The counter-point worth raising: a join is not always right. Joining a parent to a large child collection multiplies the parent columns across every child row — for wide parents with many children, two queries move less data than one join.</p>`,
fu:['Why might a join be worse than two queries?','How does DataLoader batch?','How do you prevent this from regressing?']
},
{
q:'Explain ACID and the isolation levels.',
test:'Transaction fundamentals. Being able to define the anomalies, not just name the levels.',
a:`<p><b>Atomicity</b> all or nothing. <b>Consistency</b> constraints hold before and after. <b>Isolation</b> concurrent transactions do not see each other's partial work. <b>Durability</b> a committed write survives a crash.</p>
<p>Isolation is the one with levels, because full isolation is expensive:</p>
<div class="table-scroll"><table>
<thead><tr><th>Level</th><th>Prevents</th><th>Still allows</th></tr></thead>
<tbody>
<tr><td>Read uncommitted</td><td>Nothing</td><td>Dirty reads</td></tr>
<tr><td>Read committed <span class="pill n">Postgres default</span></td><td>Dirty reads</td><td>Non-repeatable reads, phantoms</td></tr>
<tr><td>Repeatable read <span class="pill n">MySQL default</span></td><td>Non-repeatable reads</td><td>Phantoms in the standard; MySQL's gap locks largely prevent them in practice</td></tr>
<tr><td>Serializable</td><td>Everything</td><td>Nothing — at the cost of throughput and serialisation failures you must retry</td></tr>
</tbody></table></div>
<p>Define the three anomalies in one line each, because that is what they will actually ask:</p>
<ul>
<li><b>Dirty read</b> — you see data another transaction wrote but has not committed.</li>
<li><b>Non-repeatable read</b> — you read the same row twice in one transaction and get different values.</li>
<li><b>Phantom read</b> — you run the same query twice and the second time a new row matches.</li>
</ul>`,
note:`<p>Postgres <code>SERIALIZABLE</code> is optimistic: it does not block, it detects a conflict at commit time and aborts with a serialisation failure. <b>That means your application must be prepared to retry the transaction.</b> Candidates who suggest serializable without mentioning the retry loop have not run it in production.</p>`,
fu:['What is a write skew?','How would you retry a serialisation failure safely?','What isolation level would you use for a booking?']
},
{
q:'Explain cache-aside. What are its failure modes?',
test:'Directly on your resume. They will push until you hit a limit — so bring the limits yourself.',
a:`<p><b>Read:</b> check Redis; on a miss read the database and write back with a TTL. <b>Write:</b> update the database, then <b>delete</b> the key — do not update it.</p>
<p>Why delete rather than update: two concurrent writers can interleave so that the slower one writes its older value into the cache last, leaving the cache permanently stale. Deleting means the next read repopulates from the source of truth.</p>`,
code:[{code:`async function getCamp(id) {
  const hit = await redis.get(\`camp:\${id}\`)
  if (hit) return JSON.parse(hit)
  const row = await db.camp.findUnique({ where: { id } })
  if (!row) { await redis.set(\`camp:\${id}\`, 'null', { EX: 60 }); return null }  <span class="o">// negative cache</span>
  await redis.set(\`camp:\${id}\`, JSON.stringify(row), { EX: 300 })
  return row
}

async function updateCamp(id, data) {
  const row = await db.camp.update({ where: { id }, data })
  await redis.del(\`camp:\${id}\`)      <span class="o">// delete AFTER commit, not before</span>
  return row
}`}],
after:`<p>The three failure modes — this is where the marks are:</p>
<ul>
<li><b>Stale reads.</b> Between the database commit and the cache delete, readers get old data. Bounded by short TTLs and by deleting after commit. Perfect consistency is not achievable here; the honest position is that you choose an acceptable staleness window per key.</li>
<li><b>Thundering herd (cache stampede).</b> A popular key expires and a thousand concurrent requests all miss and all hit the database at once. Fix with single-flight — one request takes a short lock and refills while the others wait — or probabilistic early expiry, where each reader has a small chance of refreshing before the TTL ends.</li>
<li><b>Cache penetration.</b> Repeated requests for a key that does not exist bypass the cache every time, which is also an easy attack. Cache the negative result with a short TTL, or use a Bloom filter for high volume.</li>
</ul>
<p>And the eviction policy question: <code>allkeys-lru</code> for a pure cache; <code>volatile-lru</code> or <code>volatile-ttl</code> when the same instance also holds sessions or locks that must not be evicted. Getting that wrong means Redis silently drops your session data under memory pressure.</p>`,
fu:['What if the cache delete fails after the DB commit?','What is write-through and when is it better?','How would you cache a list endpoint rather than a single row?']
},
{
q:'What Redis data structures have you used beyond strings?',
test:'Whether Redis is "a cache" to you or a toolkit.',
a:`<div class="table-scroll"><table>
<thead><tr><th>Structure</th><th>Use it for</th></tr></thead>
<tbody>
<tr><td><b>String</b></td><td>Cached JSON, counters (<code>INCR</code>), simple flags, distributed locks via <code>SET NX EX</code>.</td></tr>
<tr><td><b>Hash</b></td><td>An object where you update one field — a session, a user profile. Cheaper than re-serialising a whole JSON string.</td></tr>
<tr><td><b>List</b></td><td>Simple queues (<code>LPUSH</code>/<code>BRPOP</code>), recent-items feeds capped with <code>LTRIM</code>.</td></tr>
<tr><td><b>Set</b></td><td>Membership and de-duplication — "has this user seen this?", unique visitors.</td></tr>
<tr><td><b>Sorted set</b></td><td>Leaderboards, sliding-window rate limits, delayed job queues scored by run-at timestamp, top-N by score.</td></tr>
<tr><td><b>Stream</b></td><td>An append-only log with consumer groups — a real queue with acknowledgement, which is what BullMQ builds on.</td></tr>
<tr><td><b>HyperLogLog</b></td><td>Approximate unique counts in 12KB regardless of cardinality. Right when "about 4.2 million uniques" is good enough.</td></tr>
</tbody></table></div>`,
code:[{label:'a distributed lock done correctly',code:`<span class="c">// acquire — NX so only one wins, EX so a crashed holder cannot deadlock</span>
const token = crypto.randomUUID()
const ok = await redis.set('lock:job', token, { NX: true, EX: 30 })

<span class="c">// release — must check ownership, or you delete someone else's lock</span>
<span class="c">// after your TTL expired. Lua makes it atomic.</span>
<span class="c">// if redis.call('GET',KEYS[1]) == ARGV[1] then return redis.call('DEL',KEYS[1]) end</span>`}],
after:`<p>The honest caveat on locks: this is safe enough for "do not run this cron twice", not safe enough for money. Redis locks can be lost during failover, which is what Redlock tries to address and why it is contested. For correctness-critical mutual exclusion, use the database.</p>`,
fu:['Is Redis durable? (RDB snapshots and AOF — understand the default is not "never lose anything".)','How would you build a delayed queue with a sorted set?','What happens to Redis on failover?']
},
{
q:'SQL to write on the whiteboard',
test:'Service companies ask these almost every time. Practise until automatic.',
a:`<p>Five queries. Know each with a window function and, where relevant, without one — some interviewers ban window functions specifically to see if you can do it the hard way.</p>`,
code:[{label:'second highest salary',code:`<span class="c">-- window function</span>
SELECT DISTINCT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) r FROM emp
) t WHERE r = 2;

<span class="c">-- without: correlated subquery</span>
SELECT MAX(salary) FROM emp WHERE salary &lt; (SELECT MAX(salary) FROM emp);</span>`},
{label:'duplicates, top-N per group, self join, running total',code:`<span class="c">-- duplicate rows</span>
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) &gt; 1;

<span class="c">-- top 3 earners per department</span>
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) rn
  FROM emp
) t WHERE rn &lt;= 3;

<span class="c">-- employees earning more than their manager</span>
SELECT e.name FROM emp e JOIN emp m ON e.manager_id = m.id
 WHERE e.salary &gt; m.salary;

<span class="c">-- running total</span>
SELECT d, amount, SUM(amount) OVER (ORDER BY d ROWS UNBOUNDED PRECEDING) AS running
FROM payments;`}],
after:`<p>Also be able to state cleanly: what each join returns; <code>WHERE</code> filters rows before grouping while <code>HAVING</code> filters groups after; <code>UNION</code> de-duplicates and <code>UNION ALL</code> does not (and is therefore faster); and that <code>COUNT(col)</code> skips nulls while <code>COUNT(*)</code> does not.</p>`,
fu:['What is the difference between RANK, DENSE_RANK and ROW_NUMBER?','Rewrite that without a window function.','What does a LEFT JOIN with a WHERE on the right table actually do? (It becomes an inner join — a classic bug.)']
},
{
q:'How would you run a schema migration with zero downtime?',
test:'Whether you have shipped a breaking change to a live system.',
a:`<p><b>Expand, migrate, contract.</b> Never do a breaking change in one step, because old and new code run simultaneously during a rolling deploy.</p>
<p>Renaming <code>full_name</code> to <code>name</code>, done safely:</p>
<ol>
<li><b>Expand.</b> Add <code>name</code> as nullable. Deploy code that writes to both columns and reads from <code>full_name</code>.</li>
<li><b>Backfill.</b> Copy in batches, not one <code>UPDATE</code> — a single statement over ten million rows locks the table and blocks everything.</li>
<li><b>Switch reads.</b> Deploy code that reads <code>name</code>, still writing both.</li>
<li><b>Contract.</b> Stop writing <code>full_name</code>, deploy, then drop the column in a later release.</li>
</ol>`,
after:`<p>Postgres specifics worth naming: <code>CREATE INDEX CONCURRENTLY</code> so building an index does not block writes; adding a <code>NOT NULL</code> column with a default is safe on modern Postgres but was a full table rewrite on older versions; and adding a foreign key takes a lock unless you add it <code>NOT VALID</code> and validate it separately.</p>`,
trap:`<p>"I'd put the app in maintenance mode." For a system that is allowed downtime that is a legitimate answer — say so if it is true. But offering it as the only answer signals you have never had to avoid it.</p>`,
fu:['How do you roll back a migration that has already run?','How do you handle a migration that takes an hour?','Where do migrations run in your CI/CD?']
},
{
q:'Rapid-fire data',
test:'Breadth. Answer each in one or two sentences.',
a:`<ul>
<li><b>SQL vs NoSQL — when genuinely MongoDB?</b> When the shape varies per document and you never need multi-entity transactions or ad-hoc joins — event payloads, CMS content, catalogues with wildly different attributes. Not "because it scales"; Postgres scales further than most teams ever need, and it has JSONB when you want document flexibility inside a relational model.</li>
<li><b>Normalisation to 3NF, and when you would denormalise.</b> Normalise by default. Denormalise a specific read path that is measurably too slow, and accept the write-time cost of keeping the copy correct.</li>
<li><b>Connection pooling.</b> Opening a Postgres connection is expensive and each one costs server memory, so you keep a pool. When it is exhausted, requests queue and then time out — which surfaces as "the API is slow" and is actually "we leaked connections" or "one slow query is holding them all".</li>
<li><b>Read replicas and replication lag.</b> The replica is behind by milliseconds to seconds. The thing that breaks is <b>read-your-own-writes</b>: a user saves, is redirected, reads from a replica, and their change is not there. Fix by routing reads to the primary for a short window after a write.</li>
<li><b>Sharding vs partitioning.</b> Partitioning splits one table across storage on one server; sharding splits data across servers. A bad shard key is one that concentrates traffic — <code>created_at</code> puts all new writes on one shard.</li>
<li><b>CAP theorem.</b> Under a network partition you choose consistency or availability. A single-node Postgres is not a distributed system, so CAP does not really apply; a Postgres cluster with synchronous replication chooses CP.</li>
<li><b>Soft delete — what does it break?</b> Every unique constraint (two "deleted" rows with the same email now collide), and every query that forgets the flag. Use a partial unique index, and put the filter in a view or repository so it cannot be forgotten.</li>
<li><b>UUID vs auto-increment as a primary key.</b> Sequential integers index tightly but leak volume and are enumerable. Random UUIDv4 fragments the B-tree and hurts insert performance at scale. <b>UUIDv7</b> is time-ordered and gets you both — that is the current best answer.</li>
<li><b>Storing money.</b> Never a float. Integer minor units, or <code>NUMERIC</code>/<code>DECIMAL</code>. <code>0.1 + 0.2 !== 0.3</code> is not an acceptable property for a payment system.</li>
<li><b>Storing timestamps.</b> <code>timestamptz</code> in UTC, always. Store the user's timezone separately if you need to render local time correctly for future events.</li>
<li><b>Where do you run a transaction in Nest?</b> In the service, not the controller, and pass the transaction handle down to the repository calls — otherwise each repository opens its own connection and you have no transaction at all.</li>
</ul>`
}
]},
{
id:'r7', code:'R7', navTitle:'DSA round',
title:'The DSA round',
meta:[['Length','45–60 min'],['Who','SDE-3 or above'],['Decides','Mid-size product and SaaS loops'],['Fail mode','Silence, or coding before thinking']],
tiers:[['saas',1],['product',1],['service',0],['agency',0]],
intro:'Your background shows no competitive programming, so this is your weakest round and the reason to sequence mid-size product companies later in your campaign. The good news: at six years on a full-stack profile they ask easy and medium problems from a narrow set of patterns, not hard graph theory. Pattern recognition beats volume.',
pre:`<div class="note"><span class="lbl">If you have three days, not three weeks</span><p>Do not attempt breadth. Do the first four patterns only — hash map, two pointers, sliding window, stack — about eight problems each, until recognition is instant. Those four cover the large majority of mediums given to full-stack candidates. Add intervals as a fifth, because your booking-marketplace background means an interviewer may reach for it deliberately.</p></div>`,
qs:[
{
q:'The eight patterns that cover most of what you will be asked',
test:'Recognition speed. At six years they expect you to name the pattern before you write code.',
a:`<div class="table-scroll"><table>
<thead><tr><th>Pattern</th><th>Recognise it by</th><th>Practise</th></tr></thead>
<tbody>
<tr><td><b>Hash map counting</b></td><td>"how many", "duplicate", "anagram", "frequency", "seen before"</td><td>Two Sum · Group Anagrams · Top K Frequent · Valid Anagram · Longest Consecutive Sequence</td></tr>
<tr><td><b>Two pointers</b></td><td>Sorted input, a pair or triplet, in-place rearrangement</td><td>Container With Most Water · 3Sum · Remove Duplicates · Valid Palindrome · Trapping Rain Water</td></tr>
<tr><td><b>Sliding window</b></td><td>"longest/shortest substring or subarray such that…"</td><td>Longest Substring Without Repeating Characters · Minimum Window Substring · Max Consecutive Ones III</td></tr>
<tr><td><b>Stack</b></td><td>Matching pairs, "next greater", parsing, undo</td><td>Valid Parentheses · Daily Temperatures · Min Stack · Largest Rectangle in Histogram</td></tr>
<tr><td><b>Binary search</b></td><td>Sorted input, or "smallest value that satisfies a monotonic predicate"</td><td>Search in Rotated Sorted Array · First and Last Position · Koko Eating Bananas</td></tr>
<tr><td><b>Tree / BFS-DFS</b></td><td>Anything with a tree, a grid, or nesting</td><td>Level Order · Max Depth · Validate BST · Lowest Common Ancestor · Number of Islands</td></tr>
<tr><td><b>Intervals</b> <span class="pill m">your domain</span></td><td>Start and end times, booking, calendars, merging</td><td>Merge Intervals · Insert Interval · Meeting Rooms II · Non-overlapping Intervals</td></tr>
<tr><td><b>Basic DP</b></td><td>"how many ways", "min cost", overlapping subproblems</td><td>Climbing Stairs · House Robber · Coin Change · Longest Increasing Subsequence</td></tr>
</tbody></table></div>`
},
{
q:'Sliding window — the template to internalise',
test:'One template solves a whole class. Knowing it cold buys you thinking time for the variation.',
code:[{label:'longest substring without repeating characters',code:`function longest(s) {
  const last = new Map()      <span class="c">// char → last index seen</span>
  let start = 0, best = 0
  for (let end = 0; end &lt; s.length; end++) {
    const c = s[end]
    <span class="c">// only move start forward, never back</span>
    if (last.has(c) &amp;&amp; last.get(c) &gt;= start) start = last.get(c) + 1
    last.set(c, end)
    best = Math.max(best, end - start + 1)
  }
  return best
}
<span class="c">// O(n) time, O(min(n, alphabet)) space</span>`}],
a:`<p>The shape generalises: expand <code>end</code> every iteration, shrink <code>start</code> while the window is invalid, record the answer. The only thing that changes between problems is what "invalid" means and what state you keep — a count map, a sum, a set.</p>`,
fu:['Now do it for at most K distinct characters.','What if the string is a stream and you cannot index backwards?']
},
{
q:'Intervals — merge, and why this matters for you',
test:'Your booking background makes this the problem an interviewer is most likely to pick for you deliberately.',
code:[{code:`function merge(intervals) {
  if (!intervals.length) return []
  intervals.sort((a, b) =&gt; a[0] - b[0])        <span class="o">// sort by start — always step one</span>
  const out = [intervals[0]]
  for (const [s, e] of intervals.slice(1)) {
    const last = out[out.length - 1]
    if (s &lt;= last[1]) last[1] = Math.max(last[1], e)   <span class="c">// overlap → extend</span>
    else out.push([s, e])
  }
  return out
}
<span class="c">// O(n log n) — the sort dominates</span>`},
{label:'meeting rooms II — minimum rooms needed',code:`<span class="c">// sweep line: +1 at every start, -1 at every end, take the running max</span>
function minRooms(meetings) {
  const events = []
  for (const [s, e] of meetings) { events.push([s, 1]); events.push([e, -1]) }
  events.sort((a, b) =&gt; a[0] - b[0] || a[1] - b[1])   <span class="o">// end before start at equal time</span>
  let cur = 0, best = 0
  for (const [, d] of events) { cur += d; best = Math.max(best, cur) }
  return best
}`}],
a:`<p>The tie-break in that sort is the whole problem: at the same timestamp, an ending meeting must be processed before a starting one, or a room that just freed up gets double-counted. That is the same half-open <code>[start, end)</code> reasoning from the machine coding round — say so, and connect it to the booking system you built.</p>`,
fu:['What if meetings can be cancelled dynamically?','How would you do this with a heap instead?']
},
{
q:'Write an LRU cache with O(1) get and put.',
test:'The most-asked design-flavoured DSA problem, and JavaScript has an elegant answer most candidates miss.',
code:[{label:'the JavaScript answer — Map preserves insertion order',code:`class LRU {
  constructor(cap) { this.cap = cap; this.m = new Map() }

  get(k) {
    if (!this.m.has(k)) return -1
    const v = this.m.get(k)
    this.m.delete(k); this.m.set(k, v)     <span class="o">// re-insert → moves to the end</span>
    return v
  }

  put(k, v) {
    if (this.m.has(k)) this.m.delete(k)
    this.m.set(k, v)
    if (this.m.size &gt; this.cap) {
      this.m.delete(this.m.keys().next().value)   <span class="c">// first key = least recent</span>
    }
  }
}`}],
a:`<p>Say out loud why this is O(1): a JavaScript <code>Map</code> guarantees insertion order, and <code>delete</code> plus <code>set</code> is the cheapest way to move a key to the most-recent end. That is language fluency, not a shortcut — but be ready to give the canonical version too, because some interviewers want it.</p>
<p><b>The canonical answer:</b> a hash map from key to node, plus a doubly linked list with sentinel head and tail. The map gives O(1) lookup; the list gives O(1) move-to-front and O(1) eviction from the tail. The sentinels exist so you never write a null check for the empty case.</p>`,
fu:['Now make it an LFU cache.','How would you make it thread-safe? (Trick question in JS — but ask about worker threads.)','How does this relate to Redis eviction policies?']
},
{
q:'JavaScript-specific implementations they ask senior candidates for',
test:'These are the "DSA" questions a frontend-leaning interviewer actually asks. They are more likely for you than a graph problem.',
a:`<ul>
<li><b>Deep flatten to a given depth</b>, without <code>Array.prototype.flat</code>. Recursive, plus the iterative stack version for when they say "no recursion".</li>
<li><b>Deep clone with circular references</b> — the <code>WeakMap</code> of seen objects from R3.</li>
<li><b><code>Promise.all</code> from scratch</b> — asked constantly. Index order and the empty array.</li>
<li><b>A promise pool</b> with concurrency N — the highest-value one to have ready.</li>
<li><b>Retry with exponential backoff and jitter.</b></li>
<li><b>An event emitter</b> with <code>on</code>, <code>off</code>, <code>once</code>, <code>emit</code>. Watch the bug: removing a listener during <code>emit</code> while iterating the live array skips the next one — iterate a copy.</li>
<li><b><code>memoize</code></b> with a configurable key resolver and a <code>Map</code> cache.</li>
<li><b><code>pipe</code> / <code>compose</code></b> — <code>const pipe = (...fns) =&gt; x =&gt; fns.reduce((v, f) =&gt; f(v), x)</code>.</li>
<li><b>Debounce and throttle</b>, with cancel and trailing edge.</li>
<li><b>A deep equality function</b> — handle arrays, dates, NaN, and different key counts.</li>
<li><b>Chunk an array</b> and <b>group by</b> — trivial, but asked as warm-ups.</li>
<li><b>Curry a function of arbitrary arity</b> — <code>fn.length</code> is how you know when it is saturated.</li>
</ul>`,
code:[{label:'event emitter — with the iteration bug fixed',code:`class Emitter {
  #m = new Map()
  on(e, fn) { (this.#m.get(e) ?? this.#m.set(e, new Set()).get(e)).add(fn); return () =&gt; this.off(e, fn) }
  off(e, fn) { this.#m.get(e)?.delete(fn) }
  once(e, fn) { const w = (...a) =&gt; { this.off(e, w); fn(...a) }; this.on(e, w) }
  emit(e, ...a) { for (const fn of [...(this.#m.get(e) ?? [])]) fn(...a) }
  <span class="c">//                              ^ copy, so off() during emit is safe</span>
}`}]
},
{
q:'How to run the round when you do not know the answer',
test:'This is the actual skill being assessed at six years. They are hiring your process at least as much as your recall.',
a:`<ol>
<li><b>Restate the problem</b> and confirm one edge case. Buys thirty seconds and stops you solving the wrong thing.</li>
<li><b>Give the brute force out loud</b> with its complexity. Never sit in silence — an interviewer cannot score thinking they cannot hear.</li>
<li><b>Name what makes it slow.</b> "The inner loop re-scans what I have already seen — that is usually a hash map." "The input is sorted and I am scanning linearly — that is usually two pointers or binary search."</li>
<li><b>State the approach and the complexity before you type</b>, and get agreement. If they say "can you do better than O(n log n)", you have just saved fifteen minutes.</li>
<li><b>Write it, then dry-run it out loud</b> on a small input — including an empty input and a single element. Finding your own off-by-one is worth more than not having one.</li>
</ol>
<p>Following that script with a working brute force scores better than a silent optimal solution. And if you are genuinely stuck, say so and ask for a hint — it costs a little, and burning ten minutes in silence costs the round.</p>`,
note:`<p>Complexities you should be able to state without pausing: hash map operations O(1) average; sorting O(n log n); binary search O(log n); BFS/DFS O(V+E); a nested loop O(n²); recursion depth is space. Getting a complexity wrong after solving the problem is a surprisingly common way to lose the round.</p>`
}
]},
{
id:'r8', code:'R8', navTitle:'System design',
title:'System design',
meta:[['Length','45–60 min'],['Who','Staff engineer or EM'],['Decides','Whether "architect" on your resume is true'],['Fail mode','Boxes and arrows with no trade-offs']],
tiers:[['product',1],['saas',1],['service',0],['agency',0]],
intro:'At six years nobody expects you to design Twitter for 500 million users. They are checking whether you can scope a problem, choose a data model, and say what you are giving up. A design with no stated trade-off is not a design — it is a diagram.',
pre:`<div class="cards">
<div class="card y"><h4>The frame, every time</h4><ul>
<li><b>Scope · 5 min.</b> Who uses it, the two or three core flows, read-heavy or write-heavy, roughly how many users. Say what you are excluding.</li>
<li><b>Numbers · 3 min.</b> DAU, peak requests per second, data written per day. You are not being tested on arithmetic — on whether you size before you build.</li>
<li><b>API · 5 min.</b> The four or five endpoints that matter. Your strength — use it early to set the tone.</li>
<li><b>Data model · 10 min.</b> Tables, keys, indexes, and the one access pattern that drives the schema.</li>
<li><b>Architecture · 10 min.</b> Client, edge, services, datastores, cache, queue. Draw it.</li>
<li><b>Deep dive · 15 min.</b> They pick one piece. Have caching and concurrency ready — those are yours.</li>
<li><b>Failure &amp; scale · 7 min.</b> What breaks first at ten times the load, and what you would do.</li>
</ul></div>
</div>`,
qs:[
{
q:'Design a camp or event booking marketplace.',
test:'They read Kampspire on your resume and will pick this deliberately. Prepare it as your set piece.',
a:`<p><b>Scope it out loud first:</b> browsing and search, viewing availability, booking with payment, and the organiser side for managing listings. Explicitly exclude reviews, messaging and refunds unless they ask.</p>
<p><b>Core entities:</b></p>`,
code:[{code:`camps    (id, org_id, title, location_id, age_min, age_max, price_cents, status)
slots    (id, camp_id, starts_at, ends_at, capacity, remaining, version)
bookings (id, slot_id, user_id, seats, status, idempotency_key, expires_at)
users    (id, email, ...)

<span class="c">-- the indexes the access pattern demands</span>
CREATE INDEX ON slots (camp_id, starts_at);
CREATE INDEX ON bookings (user_id, created_at DESC);
CREATE UNIQUE INDEX ON bookings (idempotency_key);
CREATE INDEX ON camps (location_id, price_cents) WHERE status = 'published';</span>`}],
after:`<p>The design hangs on <b>three</b> things, and the interviewer will pick one to go deep on:</p>
<h4>1 · Search</h4>
<p>Faceted filters over location, age band, interest and price. At a thousand listings this is a Postgres query with composite indexes and a GIN index for full-text — and say explicitly that you would <em>not</em> reach for Elasticsearch at that size, because it is a second system to operate and keep in sync for no measurable gain. The crossover is somewhere around a hundred thousand listings, or when you need relevance ranking and typo tolerance rather than filtering. Then the database stays the source of truth and the index is rebuilt from a change stream.</p>
<h4>2 · Booking concurrency</h4>
<p>The double-booking problem from R5.6: an atomic conditional decrement as the fast path, a unique constraint as the backstop, and an <code>Idempotency-Key</code> so a retried request after a timeout returns the original booking instead of creating a second one.</p>
<h4>3 · Payment, which is where most candidates fall down</h4>
<p><b>Never mark a booking confirmed on the client's redirect.</b> The user can close the tab, lose signal, or the redirect can be replayed. The correct flow:</p>
<ul>
<li>Create the booking as <code>pending</code> and decrement <code>remaining</code> — the seat is held.</li>
<li>Set <code>expires_at</code> a few minutes out. A background job releases holds that expire, so an abandoned checkout does not permanently consume inventory.</li>
<li>Confirm only on the payment provider's <b>webhook</b>, which must be idempotent because providers retry — verify the signature, then check whether you have already processed that event id.</li>
<li>Reconcile: a scheduled job that queries the provider for any booking still pending past its window, because webhooks do get lost.</li>
</ul>
<p>That webhook-and-reconciliation detail is what separates candidates who have shipped commerce from candidates who have read about it.</p>`,
fu:['What if the payment succeeds but your webhook handler crashes?','How do you handle a camp in a different timezone?','Ten times the traffic — what breaks first?','How would you add "5 people are looking at this slot"?']
},
{
q:'Design a real-time dashboard for AI agent performance metrics.',
test:'Straight from your GetDandy line. Know it cold.',
a:`<p>Three parts: ingest, aggregate, deliver.</p>
<p><b>Ingest.</b> Agents emit events (call started, handed off, resolved, latency, sentiment). Buffer and batch on the client side — one HTTP request per event does not survive volume. Write to an append-only events table or a stream.</p>
<p><b>Aggregate.</b> This is the key decision: <b>pre-aggregate into time buckets on write</b> rather than computing over raw events on read. Dashboards are read-heavy with a known query pattern, so paying once per event beats paying per viewer. Keep raw events for a short retention window for drill-down, and roll up into minute, hour and day tables beyond that.</p>`,
code:[{code:`events_raw     (id, agent_id, type, latency_ms, ts)        <span class="c">-- 7 day retention</span>
metrics_minute (agent_id, bucket, calls, handoffs, p95_ms)  <span class="c">-- 30 days</span>
metrics_hour   (agent_id, bucket, calls, handoffs, p95_ms)  <span class="c">-- 1 year</span>

<span class="c">-- the dashboard queries the rollup that matches its window,</span>
<span class="c">-- so "last 24h" reads 24 rows, not 4 million events</span>`}],
after:`<p><b>Deliver.</b> Server-sent events, not WebSockets — the flow is one-directional, SSE is plain HTTP, it reconnects automatically, and it passes through proxies that block WebSocket upgrades. Push <b>deltas</b>, not the whole payload. Cache the current bucket in Redis with a short TTL so a hundred open dashboards do not become a hundred identical queries every second.</p>
<p>The detail worth volunteering: <b>percentiles do not average.</b> You cannot compute a p95 across agents by averaging their individual p95s. Either store a histogram per bucket (t-digest or HDR histogram) or accept that you can only aggregate counts and sums. Interviewers who work with metrics notice this immediately.</p>`,
fu:['How do you handle an agent that goes offline mid-call?','What if a viewer opens a dashboard for a 90-day window?','How would you alert on a metric?']
},
{
q:'Design an e-commerce listing page that survives a traffic spike.',
test:'Your Shopyvilla work, framed as a scale problem.',
a:`<p>CDN in front; static or incrementally regenerated pages for catalogue content; Redis for anything dynamic. The design decision worth articulating is the <b>staleness boundary</b>:</p>
<div class="table-scroll"><table>
<thead><tr><th>Data</th><th>Acceptable staleness</th><th>Therefore</th></tr></thead>
<tbody>
<tr><td>Product title, images, description</td><td>Hours</td><td>Static, regenerated on publish</td></tr>
<tr><td>Price</td><td>Minutes</td><td>ISR with a short revalidate, or edge cache</td></tr>
<tr><td>Stock count on the listing</td><td>Minutes</td><td>Cached — an approximate number is fine</td></tr>
<tr><td>Stock at checkout</td><td class="n">Zero</td><td>Authoritative read + reservation, never cached</td></tr>
<tr><td>Cart, recommendations</td><td>Per user</td><td>Client-side after first paint</td></tr>
</tbody></table></div>
<p>Say the sentence: <em>"a design that insists on real-time accuracy everywhere cannot be cached, and therefore cannot handle the spike. The trick is to be precise about which single number has to be exact and when."</em></p>`,
after:`<p>For the spike specifically: pre-warm the cache before a known event, put a queue in front of checkout if the write path is the bottleneck, and have a degraded mode — if the recommendations service is down, render the page without recommendations rather than failing it.</p>`,
fu:['How do you invalidate a price change across the CDN?','What is a stampede and how does it show up here?','How would you handle a flash sale with 10,000 people and 100 units?']
},
{
q:'Design a notification service — email, SMS, push.',
test:'Your queue answer from R5, expanded into a system.',
a:`<p>Producers write a notification request; a queue decouples the send from the request path; per-channel workers handle provider specifics; a template service renders content.</p>
<p>The parts that make it a real design rather than three boxes:</p>
<ul>
<li><b>Retries with backoff and a dead letter queue.</b> Permanent failures (invalid address) must not be retried forever; transient ones must be.</li>
<li><b>Idempotency.</b> A producer retry must not send twice — dedupe on a notification key.</li>
<li><b>User preferences and quiet hours</b>, checked at send time rather than at enqueue time, because preferences may change while a job is queued.</li>
<li><b>Per-user rate limiting</b>, so a runaway loop does not send someone four hundred emails. This is the guardrail that has actually saved companies from public embarrassment.</li>
<li><b>Provider failover.</b> Two email providers, health-checked, with a circuit breaker.</li>
<li><b>Delivery tracking.</b> Provider webhooks for delivered, bounced and complained; a hard bounce should suppress that address permanently.</li>
</ul>`,
fu:['How do you send 1 million notifications without melting the provider?','What happens if the template service is down?','How do you test this without emailing real users?']
},
{
q:'Design a URL shortener.',
test:'The classic warm-up. It is short, so the differentiator is which detail you volunteer.',
a:`<p>Key generation is the interesting part, and there are three answers with real trade-offs:</p>
<ul>
<li><b>Base62 of an auto-increment id.</b> Simple, guaranteed unique, shortest keys — but enumerable, and it leaks how many links you have created.</li>
<li><b>Random 7 characters.</b> 62⁷ is about 3.5 trillion, so collisions are rare but must still be handled with a unique constraint and retry.</li>
<li><b>A pre-generated key pool.</b> A background job fills a table of unused keys; creation just claims one. No collision check on the hot path, and it is the answer that shows you have thought about write latency.</li>
</ul>
<p>Reads massively outnumber writes, so this is fundamentally a cache problem: Redis in front, database as source of truth, and the redirect served from the edge.</p>`,
after:`<p>The detail worth volunteering: <b>301 vs 302</b>. A 301 is cached permanently by browsers, so you get fast redirects and <em>no analytics</em> — the second click never reaches you. A 302 keeps every click observable at the cost of a round trip. If click counting is a product requirement, that decision is forced, and saying so shows you connect technical choices to product ones.</p>`,
fu:['How would you support custom aliases?','How do you expire links?','How would you count clicks without slowing the redirect?']
},
{
q:'Design a multi-tenant SaaS application.',
test:'Increasingly common, and the answer is a genuine three-way trade-off.',
a:`<div class="table-scroll"><table>
<thead><tr><th>Model</th><th>Isolation</th><th>Cost of it</th></tr></thead>
<tbody>
<tr><td><b>Shared schema, tenant_id column</b></td><td>Weakest — one missing <code>WHERE tenant_id</code> leaks data across customers</td><td>Cheapest to run and migrate. Use row-level security in Postgres so the isolation is enforced by the database, not by remembering.</td></tr>
<tr><td><b>Schema per tenant</b></td><td>Good</td><td>Migrations must run N times; connection pooling gets awkward past a few hundred tenants.</td></tr>
<tr><td><b>Database per tenant</b></td><td>Strongest — and the answer for regulated or enterprise customers</td><td>Expensive; operationally heavy; per-tenant backup and restore is a feature you now own.</td></tr>
</tbody></table></div>
<p>The pragmatic answer most companies land on, and the one to give: <b>shared schema with row-level security by default, and database-per-tenant as a premium tier for enterprise customers who require it.</b> Then the noisy-neighbour question — per-tenant rate limits and query timeouts, so one customer's report cannot degrade everyone else.</p>`,
fu:['How do you run a migration across 500 tenant schemas?','How would you move one tenant to a dedicated database?','How do you handle a tenant-specific customisation?']
},
{
q:'The rest of the designs to be able to sketch',
test:'Breadth. Any of these can appear; none needs more than a working sketch.',
a:`<ul>
<li><b>A rate limiter as a shared service.</b> The R5 answer, plus: where does it live — sidecar, gateway, or a library in each service, and what does the network hop cost you?</li>
<li><b>A file upload and processing pipeline.</b> Presigned URL → S3 event → worker → status the client subscribes to. The state machine matters more than the boxes.</li>
<li><b>An online learning platform</b> with course search and progress tracking. Your Mindbell work. The interesting part is progress: an append-only event log of "completed lesson X" beats a mutable percentage field, because it survives a course being restructured.</li>
<li><b>An authentication service</b> with refresh token rotation. R5.7 as a system.</li>
<li><b>A comment thread or activity feed.</b> Cursor pagination, not offset — with new items arriving, offset pagination shows duplicates and skips rows.</li>
<li><b>A job scheduler.</b> Cron-like triggers, at-least-once delivery, and the question they always ask: what stops two instances running the same job? (A lock, or a leader.)</li>
<li><b>An audit log.</b> Append-only, immutable, with who/what/when/before/after. The follow-up is always retention and how you query it.</li>
</ul>`
},
{
q:'Five sentences that will carry this round',
test:'Nothing — but these are the phrases interviewers write down as evidence of seniority.',
a:`<ul>
<li>"Let me confirm the scope before I design — are we optimising for reads or writes?"</li>
<li>"At this scale I would not add that yet. Here is the specific signal that would make me add it."</li>
<li>"The trade-off I am accepting here is X, and the cost is Y."</li>
<li>"This data can be stale by a minute; that data cannot be stale at all — and that difference is what drives the whole caching strategy."</li>
<li>"The first thing that breaks at ten times this load is the database, and here is what I would do about it."</li>
</ul>
<p>Two habits that matter as much as the content: <b>keep drawing</b> — an interviewer staring at a blank board stops believing you can do this — and <b>ask before you assume</b>. "Is this a global product or single-region?" changes the whole design, and asking it is free.</p>`
}
]},
{
id:'r9', code:'R9', navTitle:'AWS, Docker, CI/CD',
title:'AWS, Docker & CI/CD',
meta:[['Length','20–30 min, usually folded in'],['Who','Backend lead or DevOps'],['Decides','Whether your deployment claims are real'],['Fail mode','Overclaiming cloud depth']],
tiers:[['product',1],['saas',1],['service',1],['agency',0]],
intro:'Your AWS surface is narrow — EC2, S3, IAM. That is completely fine at six years for a full-stack role. What is not fine is letting them discover it. Own the boundary before they find it and it becomes honesty; let them find it and it becomes a gap.',
qs:[
{
q:'Describe your deployment pipeline end to end.',
test:'Whether "4 hours to 15 minutes" is a real pipeline you built or a line you wrote.',
say:`<p>A push to a branch triggers a GitHub Actions workflow: install, lint, type-check, unit tests, then a Docker build. On merge to main it builds the image, tags it with the commit SHA, pushes to the registry, and deploys to EC2 by pulling the new tag and restarting the container behind a health check. That took our release from a roughly four-hour manual process — SSH in, pull, install, build, restart, check by hand — to about fifteen minutes, which is the difference between a hotfix being an event you schedule and a hotfix being routine.</p>
<p>To be straight about the shape of it: this is Docker on EC2 instances, not a managed orchestrator. We did not run Kubernetes or ECS, because at four applications and this traffic the operational cost was not worth what it would have bought us. I can hold a conversation about ECS task definitions, but I would be learning it properly on the job rather than claiming it.</p>`,
a:`<p>That last paragraph is worth more than pretending. Every interviewer has been burned by a candidate who listed Kubernetes and could not explain a pod — and they test for it, so the downside of overclaiming is severe and the upside of honesty is real.</p>`,
fu:['How do you roll back?','What runs in CI that is not a test?','Why tag with the SHA rather than latest?']
},
{
q:'How did you cut infrastructure cost 25%?',
test:'The metric interrogation again, in the infrastructure round.',
a:`<p>Have the specific levers ready, and name which one accounted for most of it. The credible ones for your setup:</p>
<ul>
<li><b>Right-sizing.</b> Instance sizes chosen at project start and never revisited against actual CloudWatch utilisation. This is usually the biggest single win and it is the most honest answer.</li>
<li><b>Non-production environments.</b> Five environments running production-sized instances 24/7. Shrink them, and shut them down outside working hours — that alone is roughly a 65% saving on those instances.</li>
<li><b>S3 lifecycle rules</b> moving old assets to infrequent-access or Glacier.</li>
<li><b>Orphaned resources</b> — unattached EBS volumes, idle Elastic IPs, old snapshots, unused load balancers. Every long-running AWS account has these.</li>
<li><b>Savings plans or reserved instances</b> for the steady-state baseline, on-demand for the rest.</li>
<li><b>Data transfer</b> — often the invisible line item. Serving assets from S3 and CloudFront instead of from the instance.</li>
</ul>`,
say:`<p>Mostly it was right-sizing and the non-production environments. We had picked instance sizes at the start of the project and never revisited them against real utilisation, and the four non-production environments were running the same sizes as production around the clock.</p>`,
fu:['How did you measure the baseline?','What did you look at to decide a size was wrong?','What would you cut next?']
},
{
q:'Walk me through a Dockerfile for a Node service. What makes it good?',
test:'Whether you copied a Dockerfile or understand layer caching and image size.',
code:[{code:`<span class="c"># ---- build ----</span>
FROM node:26-alpine AS build
WORKDIR /app
COPY package*.json ./          <span class="o"># before the source: this layer caches</span>
RUN npm ci
COPY . .
RUN npm run build

<span class="c"># ---- run ----</span>
FROM node:26-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev &amp;&amp; npm cache clean --force
COPY --from=build /app/dist ./dist
USER node                      <span class="o"># never run as root</span>
EXPOSE 3000
HEALTHCHECK --interval=30s CMD node healthcheck.js
CMD ["node", "dist/main.js"]   <span class="o"># exec form — receives SIGTERM directly</span>`}],
a:`<p>Score the points explicitly as you go:</p>
<ul>
<li><b>Multi-stage</b>, so build tooling and dev dependencies never ship. Often a 10× size difference.</li>
<li><b>Copy the manifest before the source</b>, so the <code>npm ci</code> layer is reused when only code changes. This is the single biggest build-time win and the thing most Dockerfiles get wrong.</li>
<li><b><code>npm ci</code> not <code>npm install</code></b> — reproducible from the lockfile, and it fails rather than silently updating.</li>
<li><b>Non-root user.</b></li>
<li><b>Exec-form <code>CMD</code>.</b> Shell form wraps the process in <code>/bin/sh</code>, which does not forward SIGTERM — so your graceful shutdown from R5 never runs and every deploy kills in-flight requests.</li>
<li><b><code>.dockerignore</code></b> with <code>node_modules</code>, <code>.git</code>, <code>.env</code> — otherwise you copy the host's <code>node_modules</code> into the build context and both slow the build and risk shipping secrets.</li>
</ul>`,
fu:['Why is the image still 400MB and how would you shrink it? (distroless, or alpine + prune.)','What is a layer and why does order matter?','How do you get secrets into a build without baking them in?']
},
{
q:'How do you manage secrets and configuration across five environments?',
test:'A GetDandy question — you claimed five environments, so this is the audit.',
a:`<p>Nothing in the repository, ever. Then a layered answer:</p>
<ul>
<li><b>Pipeline secrets</b> — GitHub Actions encrypted secrets or environments with required reviewers for production.</li>
<li><b>Runtime secrets</b> — AWS Systems Manager Parameter Store (cheap) or Secrets Manager (rotation built in), read at boot or injected by the deploy.</li>
<li><b>IAM roles, not long-lived access keys.</b> An instance profile or OIDC federation from GitHub Actions means there is no static key to leak.</li>
<li><b>A committed <code>.env.example</code></b> documenting required keys without values, so a new developer knows what is needed.</li>
<li><b>Boot-time validation</b> — <code>ConfigModule</code> with a Joi or Zod schema, so a missing variable fails the process immediately with a clear message rather than causing a null-pointer at 3am inside one request path.</li>
</ul>`,
after:`<p>If they push on what you would do differently: per-environment parameter paths (<code>/app/prod/DB_URL</code>) with IAM policies scoped to the path, so the staging role literally cannot read production secrets. That is the control that turns a mistake into a permission error.</p>`,
fu:['What do you do when a secret leaks?','How do you rotate a database password with zero downtime?','How does a developer run this locally?']
},
{
q:'Rapid-fire infrastructure',
test:'Breadth. Answer honestly — this is the round where overclaiming is most likely to be caught.',
a:`<ul>
<li><b>Image vs container vs layer.</b> An image is a read-only template built from stacked layers; a container is a running instance of one with a writable layer on top.</li>
<li><b>docker-compose in development, not production.</b> It has no rolling updates, no health-based routing, no multi-host scheduling. Fine for local dependencies; not a deployment strategy.</li>
<li><b>Blue-green vs rolling vs canary.</b> Blue-green: two full environments, switch traffic, instant rollback, double the cost. Rolling: replace instances gradually, cheap, but both versions run at once so your database schema must support both. Canary: a small percentage first, watch the error rate, then proceed.</li>
<li><b>Rollback in under five minutes.</b> Because images are tagged by commit SHA, rollback is re-deploying the previous tag. The thing that makes rollback <em>hard</em> is a database migration that already ran — which is why expand-migrate-contract from R6 matters.</li>
<li><b>EC2 vs ECS vs Lambda.</b> EC2 when you want full control and a steady load. ECS/Fargate when you want containers without managing the hosts — the natural next step from where you are. Lambda for spiky, short, stateless work; watch cold starts and the 15-minute limit.</li>
<li><b>What a load balancer buys you.</b> Health-checked routing, TLS termination, zero-downtime deploys, and a place to put WAF rules. Without one you cannot deploy without dropping requests.</li>
<li><b>S3 + CloudFront over serving from Node.</b> Your process should never spend its single thread pushing static bytes. The CDN also puts the asset physically closer to the user.</li>
<li><b>IAM role vs user.</b> A user has long-lived credentials; a role is assumed temporarily and its credentials rotate automatically. Prefer roles everywhere — a leaked role session expires, a leaked access key does not.</li>
<li><b>Monitoring — be honest.</b> "Today it is structured logs, and I know that is the gap. What I would add first is error tracking (Sentry), then p95 latency and error rate per endpoint with alerts, then an uptime check. I would add tracing last, because it costs the most to instrument and pays off only once you have several services."</li>
<li><b>Have you been on call?</b> Answer truthfully. If not: "not on a formal rota — I have been the person called when a client system broke, which is the same job without the pager." Then describe an actual incident.</li>
<li><b>Zero-downtime deploy with a migration in it.</b> The expand-migrate-contract sequence, plus: migrations run as a separate step before the new code deploys, never on application boot — otherwise five instances start migrating simultaneously.</li>
<li><b>Infrastructure as code.</b> If you have not used Terraform, say so, and say what you did instead (console plus documented steps) and why that is worse — drift, no review, no reproducibility.</li>
</ul>`
}
]},
{
id:'r10', code:'R10', navTitle:'Resume grilling',
title:'Resume grilling',
meta:[['Length','30–45 min'],['Who','Architect or hiring manager'],['Decides','Whether the rest of the resume is trustworthy'],['Fail mode','A number you cannot defend']],
tiers:[['service',1],['product',1],['saas',1],['agency',1]],
intro:'Everything on your resume is a promise. This round collects on it. Write a real, specific answer to each of these before your first interview — not a script, the actual facts, so that in the room you are recalling rather than improvising.',
pre:`<div class="trap"><span class="lbl">The rule for every number below</span><p>If you cannot defend a figure, <b>do not remove it from the resume — reframe it in the room.</b> "That was our internal estimate from log counts rather than an instrumented measurement, so I would treat it as directional" is a completely acceptable sentence and it costs you almost nothing. Inventing a methodology on the spot and then contradicting yourself two questions later ends the interview.</p></div>`,
qs:[
{
q:'The ten numbers they will pick one of, at random',
test:'Whether you measure or whether you write resumes.',
a:`<ol>
<li><b>40% fewer production runtime errors</b> — over what period, measured how, from what baseline?</li>
<li><b>35% faster page loads</b> — which pages, which metric, measured with what tool?</li>
<li><b>50% less state boilerplate</b> — how do you measure boilerplate? <em>(Lines of state-management code per feature is a defensible proxy. Say it in exactly those words.)</em></li>
<li><b>4 hours to 15 minutes deployment</b> — what took four hours before, step by step?</li>
<li><b>25% infrastructure cost cut</b> — from what monthly figure to what?</li>
<li><b>40% lower initial load across 15 commerce pages</b> — what were they before?</li>
<li><b>10,000 unique monthly mobile visitors</b> — was that attributable to the PWA work or to marketing? <em>(If you do not know, say you do not know — that is the honest and correct answer.)</em></li>
<li><b>75% user adoption on the Mindbell dashboard</b> — adoption of what, by whom, over what window?</li>
<li><b>30% lower sync latency from batching 15 APIs</b> — what was the batching strategy?</li>
<li><b>5,000 registered users</b> — how many were active daily or monthly? <em>(Registered is a vanity number and a good interviewer knows it.)</em></li>
</ol>`,
after:`<p>Prepare each one in the four-beat form from R4.13: <b>measured → diagnosed → changed → verified</b>. Any answer that has all four beats survives; any answer missing "measured" does not.</p>`
},
{
q:'Draw the architecture of one of your four applications.',
test:'Whether you can produce the diagram of a system you claim to have architected. Fumbling this is the fastest way to lose a room.',
a:`<p>Pick GetDandy and practise drawing it in ninety seconds, on paper, three times tonight. What has to be on the board:</p>
<ul>
<li>Client (Next.js) and how it is served.</li>
<li>The reverse proxy or load balancer in front.</li>
<li>The Nest services and what each one owns.</li>
<li>MySQL, Redis, S3 — and what each holds.</li>
<li>The AI agent integration and which direction the calls go.</li>
<li>The five environments and what differs between them.</li>
<li>Where the real-time dashboard data comes from.</li>
</ul>
<p>Draw the boxes, then draw the <b>arrows with direction</b>, then label the arrows with the protocol. Most candidates draw boxes and stop; the arrows are where the architecture actually lives.</p>`,
fu:['Where is the bottleneck?','What would you change if you started again tomorrow?','What happens if Redis goes down?']
},
{
q:'What is the worst technical decision you have made, and what did it cost?',
test:'Self-awareness. "I care too much about code quality" fails this instantly and is remembered.',
a:`<p>Pick something real, medium-sized and genuinely owned by you. The shape: <b>the decision → why it looked right at the time → what it actually cost, concretely → how you found out → what you did about it → the rule you now carry.</b></p>
<p>A good candidate for you is committing to a state-management or rendering approach in week one of a client project and paying the migration cost later — you have lived that with Redux, so you can tell it honestly and end with a real rule: <em>"I now decide state management after the first three features rather than in week one, because the shape of the state is not knowable at the start."</em></p>`,
trap:`<p>Two failure modes. One: a fake weakness ("I take on too much"). Two: a decision that was not yours, told as though it was — interviewers probe, and the story collapses when they ask what you would have done differently and you have no answer because you never made the call.</p>`,
fu:['How long did it take you to notice?','Who else was affected?','What stopped you from seeing it earlier?']
},
{
q:'You wrote the API and frontend standards. Give me three rules and why each exists.',
test:'Whether you wrote standards or copied them.',
a:`<p>Three, each with its reason attached. Rules without reasons sound borrowed:</p>
<ul>
<li><b>Every endpoint returns the same error envelope.</b> Because otherwise every client writes bespoke error handling per call, and the third one gets it wrong.</li>
<li><b>No business logic in a controller.</b> Because a controller can only be tested through HTTP, so logic that lives there is logic nobody tests.</li>
<li><b>Validation at the boundary with unknown properties stripped.</b> Because it prevents both malformed data and mass assignment, and it means every layer below can trust its inputs.</li>
</ul>
<p>Then be ready for the harder question underneath: <b>how did you get the team to follow them?</b> The honest answer — documented, enforced in code review, and where possible automated with a lint rule or a shared base class, because a standard that depends on remembering is a standard that decays.</p>`,
fu:['How do you handle someone who disagrees with a standard?','Which of your own rules do you break, and when?','How do you introduce a standard to an existing codebase?']
},
{
q:'Tell me about a production incident.',
test:'The single highest-signal behavioural question for a senior engineer. Have one prepared in full detail.',
a:`<p>Structure: <b>what broke → how you found out → what you did in the first ten minutes → the root cause → the change that made recurrence impossible.</b></p>
<p>Two things that separate a good answer:</p>
<ul>
<li><b>Restore first, diagnose second.</b> If your story has you debugging before rolling back, expect to be marked down at any level above three years.</li>
<li><b>The prevention has to be structural.</b> "We were more careful after that" is not a fix. "We added a constraint / an alert / a test that would have caught it" is.</li>
</ul>
<p>And "how you found out" matters more than people expect: if the answer is "the client told us", say so honestly and then say what monitoring you added so that it would not be the client next time.</p>`,
fu:['How long was it down?','What did you tell the client?','Did it happen again?']
},
{
q:'The rest of the grilling',
test:'Depth behind each resume line.',
a:`<ul>
<li>What is the largest data volume you have worked with?</li>
<li>What is the highest traffic you have personally handled? <em>(Answer honestly. "Not high by product-company standards — five thousand users. What I have depth in is the delivery and reliability side of that" is a fine answer; inflating it is not.)</em></li>
<li>How do you decide what to test? What is your coverage on the services you designed? <em>(Prepare this one — there is no testing on your two most recent roles in the resume, and they will notice.)</em></li>
<li>Describe your code review standard. What do you actually reject a PR for?</li>
<li>How do you mentor a junior? Name a specific person and what changed for them.</li>
<li>How do you estimate? When were you last badly wrong, and what did you do about it?</li>
<li>How do you handle a client asking for something you think is a bad idea?</li>
<li>Which part of your stack do you know least well? <em>(Answer it. Refusing to name one is worse than any answer you could give.)</em></li>
<li>What have you learned in the last six months? <em>(Have a real, specific answer — the React Compiler, the Next 16 caching model, something you actually read.)</em></li>
<li>What would your current lead say your weakness is?</li>
<li>Why three companies in six years? <em>(Two years, one year three months, three years is not a red flag. Have the arc: each move added scope — feature work, then ownership, then architecture.)</em></li>
<li>Walk me through a piece of code you are proud of. <em>(Have one. Ideally on GitHub, ideally something you can open.)</em></li>
</ul>`
}
]},
{
id:'r11', code:'R11', navTitle:'Behavioural',
title:'Behavioural & hiring manager',
meta:[['Length','45 min'],['Who','Engineering manager or CTO'],['Decides','Your level, and often your number'],['Fail mode','Generic answers with no specific story']],
tiers:[['service',1],['product',1],['saas',1],['agency',1]],
intro:'Prepare six real stories and you can answer any question in this round, because the twenty questions map onto the same handful of events. Situation, task, action, result — and spend most of the time on the action, because that is the only part that is about you.',
pre:`<div class="cards">
<div class="card"><h4>1 · A production failure you owned</h4><p>What broke, how you found out, the first ten minutes, and the structural change that made recurrence impossible.</p></div>
<div class="card"><h4>2 · A disagreement you lost</h4><p>You argued a technical position, did not win, committed fully anyway, and it worked out. More valuable than one you won.</p></div>
<div class="card"><h4>3 · A difficult client or stakeholder</h4><p>Scope change, an impossible deadline, or a demand you pushed back on. You have three agencies of material.</p></div>
<div class="card"><h4>4 · Shipping under real time pressure</h4><p>What you deliberately cut, and how you made sure the debt was recorded rather than quietly forgotten.</p></div>
<div class="card"><h4>5 · Someone you made better</h4><p>A specific junior, a specific weakness, what you did, and what they can do now that they could not before.</p></div>
<div class="card"><h4>6 · A decision you reversed</h4><p>You committed, evidence came in against it, and you changed course. Shows you update on data rather than on ego.</p></div>
</div>`,
qs:[
{
q:'Tell me about a time you disagreed with a technical decision.',
test:'Whether hiring you means hiring an argument.',
a:`<p>The strongest version of this story ends in one of two places: <em>"and I was wrong"</em>, or <em>"and I lost, and I committed fully anyway, and here is how I made it work."</em></p>
<p>Managers are screening for disagree-and-commit. A candidate who wins every story they tell is either lucky, or is telling you they do not let things go.</p>`,
trap:`<p>The story where you were right, they did not listen, and it later broke — told with satisfaction. Even when true, the tone is what gets scored, and it reads as "I will say I told you so."</p>`,
fu:['What would you do if the same thing happened here?','How did the other person feel about it afterwards?']
},
{
q:'Your app is down in production and you are the only engineer available. What do you do?',
test:'Whether your instinct is to restore or to investigate. There is a right answer.',
a:`<p>In this order, and the order is the answer:</p>
<ol>
<li><b>Confirm the blast radius.</b> Everything, or one endpoint? All users, or one tenant?</li>
<li><b>Communicate immediately</b>, before you have a diagnosis, with an expectation for the next update. Silence is what turns an outage into a relationship problem.</li>
<li><b>Restore service.</b> Roll back to the last known good release. Do not debug production while it is down.</li>
<li><b>Verify recovery</b> against a real user path, not just a health check returning 200.</li>
<li><b>Then investigate</b>, on the artifact and the logs, not on the live system.</li>
<li><b>Blameless write-up</b> with one concrete prevention action that has an owner and a date.</li>
</ol>`,
fu:['What if rolling back is not possible because of a migration?','Who do you tell first?','What goes in the write-up?']
},
{
q:'Why do you want to work here?',
test:'Whether you researched. On a walk-in day this is where most candidates are visibly caught out.',
a:`<p>Ten minutes on their website and LinkedIn before you walk in — for every company, in the queue if necessary. Then name their product, name something specific about the problem it solves, and connect it to something you have actually built.</p>
<p>"You are solving X, and the closest thing I have built is Y, which is why the problem is interesting to me" beats any amount of enthusiasm. Enthusiasm without specificity reads as the same answer you gave the company down the road.</p>`,
trap:`<p>"I've heard great things about the culture" and "I want to work with cutting-edge technology." Both are content-free, both are said by everyone, and both signal you did not look them up.</p>`,
fu:['What do you think our biggest technical challenge is?','Who do you think our competitors are?']
},
{
q:'Where do you see yourself in three years?',
test:'Whether you will still be there. They are pricing the cost of replacing you.',
a:`<p>For your profile the answer that lands is <b>depth, not title</b>: owning a system end to end, being the person the team asks about the architecture, growing into technical leadership through influence rather than headcount.</p>
<p>If you genuinely want people management, say so — but frame it as an interest to grow into, not a condition. And do not say "running my own company", however true, in a round designed to test retention.</p>`,
fu:['What would make you leave after a year?','Do you want to manage people?']
},
{
q:'You have worked remotely for three years. How will you work in an office team?',
test:'A real question for you specifically, and the interviewer may not ask it directly — they will just wonder.',
a:`<p>Get ahead of it. Frame remote as having made you <em>better</em> at the things offices are bad at — written communication, asynchronous decision records, making your work visible without being seen — and then say plainly that you moved cities to be in a room with people, which is a stronger signal than any answer.</p>`,
fu:['How do you handle a disagreement over text?','What did you find hardest about remote work?']
},
{
q:'The rest of the round',
test:'Same six stories, twenty different doors into them.',
a:`<ul>
<li>Tell me about a project that failed.</li>
<li>How do you handle competing priorities from two stakeholders?</li>
<li>Describe a time you had to learn something quickly.</li>
<li>How do you give critical feedback on a colleague's code?</li>
<li>How do you receive it? Tell me about feedback that stung.</li>
<li>What do you do when you are blocked?</li>
<li>Describe your ideal team and your ideal manager.</li>
<li>How do you keep quality up when the deadline will not move?</li>
<li>Tell me about a time you said no.</li>
<li>What motivates you, and what makes you disengage?</li>
<li>Tell me about a time you had to work with someone difficult.</li>
<li>How do you decide when something is good enough to ship?</li>
<li>What is the hardest bug you have ever debugged? <em>(Have a real one, with the diagnostic path — this doubles as a technical question.)</em></li>
<li>What do you do outside work? <em>(You have a public learning platform with 85 chapters written. Lead with it — it is genuinely differentiating and it evidences everything else you have claimed about standards and mentoring.)</em></li>
<li>What questions do you have for me? <em>(Never "none." See below.)</em></li>
</ul>`
},
{
q:'What you ask them — and the one question almost nobody asks',
test:'This is scored. Two or three good questions, tailored to who is in front of you.',
a:`<h4>To the engineer who interviewed you</h4>
<ul>
<li>What does the path from merged pull request to production look like, and how long is it?</li>
<li>What is the test and code review culture actually like — not aspirationally?</li>
<li>What is the part of the codebase everyone is slightly afraid of?</li>
<li>How much of your week is feature work versus maintenance and incidents?</li>
</ul>
<h4>To the hiring manager</h4>
<ul>
<li>What would someone need to have done in the first six months for you to consider this hire a clear success?</li>
<li>Why is this role open — growth, or a replacement?</li>
<li>How does the team decide what gets built, and how much say does engineering have?</li>
<li>What is the biggest technical risk facing the team in the next year?</li>
</ul>
<h4>To HR</h4>
<ul>
<li>What is the fixed-to-variable split, and what percentage of variable was actually paid out last year?</li>
<li>How does the appraisal cycle work, and what was the average increment last cycle?</li>
<li>Is there a formal engineering level structure, and where would this role sit?</li>
</ul>`,
note:`<p><b>The one worth asking every single time:</b> "Is there anything about my background that gives you hesitation, that I could address now?" It is uncomfortable and it works. Either you get to answer the objection while you are still in the room, or they say no and you have closed the loop cleanly. Almost nobody asks it, and interviewers remember the people who do.</p>`
}
]},
{
id:'r12', code:'R12', navTitle:'HR & the number',
title:'HR & the number',
meta:[['Length','15–30 min'],['Who','HR business partner'],['Decides','What is actually on your offer letter'],['Fail mode','Accepting in the room']],
tiers:[['service',1],['product',1],['saas',1],['agency',1]],
intro:'The technical rounds decide whether you get an offer. This round decides what is in it. Treat it with the same seriousness, because an hour here is worth more per minute than any other hour in the process.',
pre:`<div class="trap"><span class="lbl">The thing to understand before you say any number</span><p>You earn ₹1,02,000 a month in hand with <b>no PF and no deductions</b> — so your take-home and your cost-to-company are effectively the same figure, ₹12.24 lakh a year of real cash. Almost no Bangalore offer works that way. A typical package hides ten to twenty percent of the headline in variable pay, employer PF, gratuity accrual, and then income tax on top. <b>A "₹16 lakh" offer at a normal product company pays you roughly ₹1,00,100 a month — a thirty percent hike on paper and a pay cut in practice.</b></p></div>`,
qs:[
{
q:'What each headline number actually pays you',
test:'Nothing — this is the table to memorise before you walk in.',
a:`<div class="table-scroll"><table>
<thead><tr><th>Offered CTC</th><th>Monthly in hand</th><th>Real change</th><th>Verdict</th></tr></thead>
<tbody>
<tr><td class="n">₹16 LPA</td><td class="n">≈ ₹1,00,100</td><td class="n">−2%</td><td><span class="pill r">reject</span> a pay cut wearing a hike's clothes</td></tr>
<tr><td class="n">₹18 LPA</td><td class="n">≈ ₹1,11,200</td><td class="n">+9%</td><td><span class="pill r">reject</span> less than staying put and taking an appraisal</td></tr>
<tr><td class="n">₹20 LPA</td><td class="n">≈ ₹1,22,200</td><td class="n">+20%</td><td><span class="pill y">floor</span> only for a company you badly want</td></tr>
<tr class="hi"><td class="n">₹22 LPA</td><td class="n">≈ ₹1,32,600</td><td class="n">+30%</td><td><span class="pill m">accept</span> a real move</td></tr>
<tr class="hi"><td class="n">₹24 LPA</td><td class="n">≈ ₹1,43,000</td><td class="n">+40%</td><td><span class="pill m">target</span> say this number out loud</td></tr>
<tr><td class="n">₹26 LPA</td><td class="n">≈ ₹1,52,900</td><td class="n">+50%</td><td><span class="pill m">anchor</span> where you open</td></tr>
<tr><td class="n">₹28 LPA</td><td class="n">≈ ₹1,61,300</td><td class="n">+58%</td><td><span class="pill m">stretch</span> reachable if two offers compete</td></tr>
</tbody></table></div>
<p style="font-size:.88rem;color:var(--pencil)">Modelled on a standard Bangalore structure: 10% variable, basic at 40% of fixed, employer and employee PF at 12% of basic, gratuity accrual, new tax regime with the ₹75,000 standard deduction. <b>If an offer is fully fixed with no variable, treat it as roughly one band higher</b> — a fully fixed ₹22 lakh behaves like ₹24 lakh here. Indicative, not exact; your real number depends on the specific structure.</p>`,
after:`<div class="cards">
<div class="card g"><h4>Anchor · ₹26 lakh</h4><p>The first number you say. Never open at what you would accept.</p></div>
<div class="card"><h4>Target · ₹24 lakh</h4><p>A forty percent real increase. Defensible for six years with production architecture ownership.</p></div>
<div class="card r"><h4>Walk away · ₹20 lakh</h4><p>Below this you work harder in a more expensive city for the same money. Bangalore rent eats the difference.</p></div>
</div>`
},
{
q:'What band should you expect from each type of company?',
test:'Where to spend your week.',
a:`<div class="table-scroll"><table>
<thead><tr><th>Type</th><th>Realistic for you</th><th>Read</th></tr></thead>
<tbody>
<tr><td><b>Service &amp; consulting</b><br><span style="font-size:.85rem;color:var(--pencil)">TCS, Infosys, Cognizant, LTIMindtree, Mphasis, Nagarro</span></td><td class="n">₹15–19 LPA</td><td><span class="pill r">mostly below your floor</span> The easiest walk-ins and the worst economics for you specifically, because your zero-deduction package is already worth more than their structure. Practice and safety net, not a plan. Nagarro and Mphasis at the top of their band are the only realistic ones.</td></tr>
<tr><td><b>Agencies &amp; studios</b></td><td class="n">₹16–21 LPA</td><td><span class="pill y">borderline</span> Fast to close, two rounds, and your client-ownership story is their exact problem. Push hard for fully fixed here — many can do it, and that is worth a whole band.</td></tr>
<tr class="hi"><td><b>Series A–C product startups</b></td><td class="n">₹20–28 LPA</td><td><span class="pill m">your best market</span> They pay for exactly what you have: someone who takes an empty repo to production and stays for the reliability. Harder loop, better money.</td></tr>
<tr class="hi"><td><b>Mid-size product &amp; SaaS</b><br><span style="font-size:.85rem;color:var(--pencil)">Freshworks, Zoho, Chargebee, Postman tier</span></td><td class="n">₹22–30 LPA</td><td><span class="pill m">highest ceiling</span> Hardest loop — real DSA and a design round with a bar. Worth the seven-day prep. Do not walk into these cold on day one.</td></tr>
</tbody></table></div>`
},
{
q:'What are your salary expectations?',
test:'Whether you anchor or get anchored.',
say:`<p>My current fixed is ₹12.2 lakh, and the important part is that it is entirely fixed and entirely in hand — no variable, no PF deduction, so I take home ₹1,02,000 every month. That is why I compare offers on monthly in-hand rather than CTC. For this role I am looking at ₹26 lakh, and I am flexible on how it is structured.</p>`,
a:`<p>Then <b>stop talking.</b> The silence after a number is uncomfortable and the person who fills it loses. Practise this literally: say the number, close your mouth, and count to ten if you have to.</p>`,
trap:`<p>Softening the number in the same breath — "₹26 lakh, but I'm negotiable, obviously it depends." You have just told them the real number is lower and invited them to find it. Be flexible on <em>structure</em>, out loud; be silent about flexibility on the total.</p>`,
fu:['Is that fixed or total?','What is driving that number?','Can you share your current payslip?']
},
{
q:'That is above our band. What is the minimum you would accept?',
test:'Whether you will negotiate against yourself. Almost everyone does.',
a:`<p>Never answer this with a number. It converts your floor into their ceiling in one sentence.</p>`,
say:`<p>I would rather not put a floor on the table before I understand the full structure — the fixed and variable split changes what a number is worth quite a lot. What is the top of the band for this role? If it is genuinely below what works for me, I will tell you straight away rather than waste your team's rounds.</p>`,
after:`<p>That last clause matters. Offering to disqualify yourself early is credible and generous, and it makes the refusal to name a floor read as efficiency rather than gamesmanship.</p>`,
fu:['We cannot share bands.','Would you consider ₹X?']
},
{
q:'They push back: "that is a very high expectation for your experience."',
test:'Whether you can justify a number with reasoning rather than defend it with feeling.',
say:`<p>I understand, and I would rather explain the reasoning than just hold a number. Because I have no deductions today, an ₹18 lakh offer with a variable component and PF actually lands me around ₹1.11 lakh a month — that is a nine percent increase for relocating to a more expensive city, which does not work. At ₹24 lakh the move makes sense for both of us. If the band caps below that, I would genuinely rather know now.</p>`,
a:`<p>This works because it moves the conversation from "what you want" to "arithmetic we can both check". It is very hard to argue with, and it does not require them to agree you are worth more — only that the maths is the maths.</p>`,
fu:['Where did you get those numbers?','We could look at a joining bonus instead.']
},
{
q:'We can offer you X. Can you confirm today?',
test:'Urgency pressure. Same-day acceptance is worth nothing to you and everything to them.',
say:`<p>Thank you — that is a serious offer and I am genuinely interested. Could you send the written breakdown with the fixed and variable split? I will come back to you within forty-eight hours. I have one other process closing this week and I would rather give you a clean yes than a rushed one.</p>`,
a:`<p>Never accept in the room, even when the number is good — <b>especially</b> when the number is good, because that is when they expect you to be too pleased to negotiate.</p>
<p>Then use those forty-eight hours: email every other live process saying you have an offer in hand with a deadline. That single email is the highest-return action in your entire job search. It is the difference between negotiating with words and negotiating with alternatives.</p>`,
trap:`<p>An "exploding offer" that expires in 24 hours is a pressure tactic, and how a company behaves here is real information about how it behaves later. A company that will not give you two days to consider a multi-year decision is telling you something.</p>`,
fu:['The offer is only valid until Friday.','What would it take to close this today?']
},
{
q:'Five things to check before you sign anything',
test:'The details that turn a good headline into a bad job.',
a:`<ol>
<li><b>Fixed versus variable, in writing.</b> "₹24 lakh" with ₹6 lakh variable is an ₹18 lakh job with a bonus you might get.</li>
<li><b>Was the variable actually paid last year, and at what percentage?</b> Ask directly. A straight answer tells you a lot about the company; an evasive one tells you more.</li>
<li><b>Joining bonus and its clawback period.</b> Usually one year. It is real money but it is not salary — never let it be used to close a gap in fixed pay, because year two you are back to the lower number.</li>
<li><b>Notice buyout.</b> Ask them to reimburse it. Many will, it costs them almost nothing structurally, and it is the easiest concession in the whole negotiation.</li>
<li><b>Equity, if a startup.</b> Ask for three things: the strike price, the total outstanding shares (not just your count), and the last round's valuation. Without all three the number of options is meaningless. If they will not give you all three, value the equity at zero and negotiate on cash. Also ask about the cliff, the vesting schedule, and the exercise window after leaving.</li>
</ol>`,
note:`<p><b>The tactic worth more than every script on this page:</b> get two offers in the same week. Technique moves a number by maybe ten percent; a second live offer moves it by thirty. That is the real argument for walk-ins — do not treat them as one interview at a time, treat them as a compressed campaign where four processes land in the same seven days. Interview at the companies you want least on day one.</p>`
},
{
q:'The rest of the HR round, and what to have on your phone',
test:'Logistics. Walk-ins ask for documents on the spot.',
a:`<p><b>They will ask:</b></p>
<ul>
<li>Confirm current CTC with payslips or Form 16.</li>
<li>Notice period, last working day, earliest joining date.</li>
<li>Are you holding other offers, and at what number? <em>(You may decline to name the company; a range is fine.)</em></li>
<li>Background verification consent — employment, education, sometimes address.</li>
<li>Any gaps to explain?</li>
<li>Comfortable with the location and the five-day model?</li>
<li>What would make you turn this down?</li>
</ul>
<p><b>Have on your phone before you walk in:</b></p>
<ul>
<li>Last three payslips and your most recent Form 16.</li>
<li>Offer letters and relieving letters from previous employers.</li>
<li>Degree and diploma certificates as PDFs.</li>
<li>PAN and Aadhaar.</li>
<li><b>Six printed copies of your resume.</b> Walk-ins run on paper and you will be asked for it three times in one building.</li>
</ul>`
}
]},
{
id:'s0', code:'50L', navTitle:'What changes at ₹50L', lv:2,
title:'What actually changes at the ₹50L bar',
meta:[['Track','Staff / SDE-3'],['Timeline','2–3 years, two jumps'],['Real blocker','The resume, not the interview']],
tiers:[['read before you prep',1]],
intro:'The ₹20–28L rounds test whether you can build. These test whether you can be trusted with a system nobody fully understands, and with decisions that cost money if you are wrong. Different bar, different preparation, different timeline — and one thing you already have that most candidates do not.',
qs:[
{
q:'The five gaps between where you are and ₹50L',
test:'Honest calibration. Prepping the wrong things for a year is the expensive mistake here.',
a:`<div class="table-scroll"><table>
<thead><tr><th>Gap</th><th>Where you are</th><th>Where the bar is</th></tr></thead>
<tbody>
<tr><td><b>Scale</b></td><td>5,000 users, one region, one database</td><td>Millions of users, sharded data, multi-region, real QPS numbers you have personally watched</td></tr>
<tr><td><b>DSA</b></td><td>Patterns, mediums</td><td>Two rounds, at least one hard. Graphs, advanced DP, heaps, tries — solved live in 35 minutes</td></tr>
<tr><td><b>Design</b></td><td>Caching, concurrency, a good API</td><td>Consistency models, consensus, partition tolerance, exactly-once semantics, capacity maths</td></tr>
<tr><td><b>Brand</b></td><td>Three client studios</td><td>Recognisable product company on the resume — unfair, and it is what gets you shortlisted</td></tr>
<tr><td><b>Scope of influence</b></td><td>You own four applications</td><td>You changed how several teams work, and can evidence it</td></tr>
</tbody></table></div>
<p>Four of those five are closeable with study. <b>Brand is not</b> — and it is the one that decides whether anybody reads your resume. That is why the path below is two jumps and not one.</p>`
},
{
q:'The two-jump plan, with dates',
test:'Whether you optimise for the next offer or for the one after it.',
a:`<p><b>₹12L → ₹50L is not a job change. It is a trajectory.</b> Trying to do it in one move is the single most common way ambitious engineers waste two years applying to roles that never call back.</p>
<div class="cards">
<div class="card g"><h4>Now → 3 months</h4><p>Land ₹22–26L at a real product company. Optimise for <b>scale exposure and a name</b>, not for the top of the band. A ₹24L offer at a company with real traffic beats ₹27L at another studio, and it is not close.</p></div>
<div class="card"><h4>Months 3–24</h4><p>Get on-call. Own a service with real QPS. Drive one migration that touches another team. Learn the distributed side <b>on the job</b>, where it is free, rather than from a book. Meanwhile: DSA, 4 hours a week, every week.</p></div>
<div class="card"><h4>Months 24–30</h4><p>Interview at the ₹45–55L tier with two years of product-company scale on the resume, a brand recruiters recognise, and DSA that is warm rather than cold. This jump is <em>normal</em> at that point.</p></div>
</div>
<p>The uncomfortable part: the highest-leverage decision you make in the next three months is <b>which company</b>, not <b>which number</b>. A ₹2L difference today is worth nothing against the ₹25L difference that the right brand and the right traffic make in two years.</p>`,
note:`<p>The one shortcut worth taking seriously: <b>US-remote roles hiring in India.</b> They skip the brand filter, pay well above local bands, and weigh portfolio and communication far more heavily — both of which you are strong on. It is a harder search with fewer openings and it needs referrals, but for your specific profile it is the most realistic way to compress two jumps into one.</p>`
},
{
q:'Your resume is the blocker, not your ability.',
test:'Nothing. This is the thing to fix first, because everything else is downstream of getting shortlisted.',
a:`<p>At ₹22–28L a good recruiter reads your bullets. At ₹50L a screener spends eight seconds looking for a company name they recognise and a scale number that is large. You have neither, so the technical preparation never gets used.</p>
<p><b>Three things that change that, in order of impact:</b></p>
<ol>
<li><b>Referrals.</b> Above ₹40L, cold applications convert at close to nothing. A referral skips the screener entirely. This is not a networking platitude — it is the actual mechanism, and it is the highest-return hour you can spend.</li>
<li><b>Lead with Groundwork.</b> You built a learning platform with 85 chapters, 299 runnable exercises, and published tracks in JavaScript, DSA and System Design. Most six-year engineers have nothing like it. <b>Those are exactly the three subjects a ₹50L loop tests</b> — and you are teaching them. Put it in the top third of your resume with the numbers, not in a "personal projects" footer.</li>
<li><b>Replace vanity numbers with hard ones.</b> "5,000 registered users" is a small number stated plainly. If you have p95 latency, requests per second, data volume, uptime, or cost figures, those read as an engineer who operates systems. If you do not have them, that is a thing to start collecting at your next job from week one.</li>
</ol>`,
say:`<p>Alongside my work I write and maintain Groundwork, a technical learning platform — 85 chapters and 299 runnable exercises across JavaScript engine internals, algorithms and system design, with about 15 hours of written material. Teaching a thing at that depth is how I know I actually understand it.</p>`
},
{
q:'What to build in the next six months to close the scale gap',
test:'Whether you can manufacture the evidence you are missing, honestly.',
a:`<p>You cannot fake having handled millions of users. You <em>can</em> build something where the interesting problems are the ones that only appear at scale, and then talk about them with real numbers. Three that would genuinely move your interviews:</p>
<ul>
<li><b>Load-test something you own and write up what broke.</b> Point k6 or Artillery at one of your services, find the knee of the curve, fix the first bottleneck, measure again. "I took it from 400 to 3,000 requests per second and here is what the profile showed at each step" is a scale story with real numbers, and it takes a weekend.</li>
<li><b>Build one thing that is genuinely distributed.</b> A job queue with at-least-once delivery, idempotent consumers and a dead letter queue. Small, but it forces you through exactly-once semantics, retries and partial failure — the vocabulary of the design round.</li>
<li><b>Instrument something properly.</b> OpenTelemetry traces, p50/p95/p99 dashboards, an alert on an error budget. This closes attack 4 from the scouting report, and observability is a real interview topic at this level rather than a footnote.</li>
</ul>
<p>Each of these is small enough to finish and specific enough to talk about for ten minutes. That combination is what makes a side project useful in an interview; a half-built clone of a famous app is not.</p>`
}
]},
{
id:'s1', code:'50L', navTitle:'Hard DSA', lv:2,
title:'DSA at the ₹50L bar',
meta:[['Length','2 rounds, 45–60 min each'],['Who','SDE-3 / Staff'],['Bar','At least one hard, solved live'],['Prep','8–12 weeks, not one']],
tiers:[['saas',1],['product',1]],
intro:'At ₹20–28L the patterns in R7 are enough. Here they are the floor. You will get one medium as a warm-up and one hard, and the hard will be a graph, a non-obvious DP, or a heap problem wearing a disguise. The good news: the topic list is finite and the same twelve shapes recur endlessly.',
qs:[
{
q:'Graphs — the four algorithms that cover most graph questions',
test:'Graphs are the single biggest gap for self-taught full-stack engineers, and the most likely hard you will face.',
a:`<p>Almost every graph question is one of four things wearing a costume. Learn to see the costume.</p>
<ul>
<li><b>BFS</b> — shortest path in an <em>unweighted</em> graph, level-by-level processing, "minimum number of steps".</li>
<li><b>DFS</b> — connectivity, cycle detection, flood fill, "can I reach", path enumeration.</li>
<li><b>Topological sort</b> — anything with dependencies or ordering. Course Schedule, build systems, task ordering. If the words "prerequisite", "depends on" or "order" appear, this is it.</li>
<li><b>Union-Find</b> — connected components under incremental merging. Number of Provinces, Redundant Connection, Kruskal's MST, and the "are these two in the same group" family.</li>
</ul>`,
code:[{label:'topological sort — Kahn, and the cycle detection you get for free',code:`function topo(n, edges) {
  const adj = Array.from({length:n}, () =&gt; [])
  const indeg = new Array(n).fill(0)
  for (const [a, b] of edges) { adj[a].push(b); indeg[b]++ }   <span class="c">// a → b</span>

  const q = []
  for (let i = 0; i &lt; n; i++) if (indeg[i] === 0) q.push(i)

  const out = []
  while (q.length) {
    const v = q.shift()
    out.push(v)
    for (const nx of adj[v]) if (--indeg[nx] === 0) q.push(nx)
  }
  <span class="o">return out.length === n ? out : null</span>   <span class="c">// short → a cycle exists</span>
}
<span class="c">// O(V + E). Use a pointer instead of shift() for real performance.</span>`},
{label:'union-find with both optimisations — write it from memory',code:`class DSU {
  constructor(n) { this.p = [...Array(n).keys()]; this.r = new Array(n).fill(0) }
  find(x) {
    while (this.p[x] !== x) { this.p[x] = this.p[this.p[x]]; x = this.p[x] }  <span class="c">// path halving</span>
    return x
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b)
    if (ra === rb) return false                       <span class="c">// already connected → a cycle</span>
    if (this.r[ra] &lt; this.r[rb]) [ra, rb] = [rb, ra]  <span class="c">// union by rank</span>
    this.p[rb] = ra
    if (this.r[ra] === this.r[rb]) this.r[ra]++
    return true
  }
}
<span class="c">// near O(1) amortised per operation</span>`}],
after:`<p><b>Practise:</b> Number of Islands · Course Schedule I &amp; II · Clone Graph · Rotting Oranges · Word Ladder · Pacific Atlantic Water Flow · Number of Provinces · Redundant Connection · Accounts Merge · Alien Dictionary.</p>
<p>The two things interviewers watch for: do you build the adjacency list cleanly, and do you handle the <b>disconnected graph</b> — a single BFS from node 0 misses everything else, so the outer loop over all nodes is not optional.</p>`,
fu:['Now do it iteratively instead of recursively.','What if the graph has 10 million nodes?','How do you detect a cycle in a directed vs undirected graph?']
},
{
q:'Dijkstra, and when it is the wrong answer',
test:'Weighted shortest path. Asked directly, and hidden inside "cheapest route" problems.',
code:[{code:`function dijkstra(n, adj, src) {          <span class="c">// adj[u] = [[v, w], ...]</span>
  const dist = new Array(n).fill(Infinity)
  dist[src] = 0
  const pq = new MinHeap([[0, src]])       <span class="c">// [distance, node]</span>

  while (pq.size) {
    const [d, u] = pq.pop()
    if (d &gt; dist[u]) continue              <span class="o">// stale entry — the lazy-deletion trick</span>
    for (const [v, w] of adj[u]) {
      if (d + w &lt; dist[v]) { dist[v] = d + w; pq.push([d + w, v]) }
    }
  }
  return dist
}
<span class="c">// O((V + E) log V)</span>`}],
a:`<p>The <code>if (d &gt; dist[u]) continue</code> line is the whole trick: JavaScript has no decrease-key, so you push duplicates and skip the stale ones when they surface. Candidates who omit it get a correct but slow solution and usually cannot explain why.</p>
<p><b>When Dijkstra is wrong:</b> negative edge weights — it will silently return the wrong answer, not fail. That is Bellman-Ford's territory (and it detects negative cycles). For unweighted graphs BFS is simpler and faster. For a grid with 0/1 weights, 0-1 BFS with a deque beats a heap.</p>`,
fu:['What if there are negative weights?','Network Delay Time · Cheapest Flights Within K Stops · Path With Minimum Effort','Why not just use BFS?']
},
{
q:'Heaps — the three shapes that keep coming back',
test:'"Top K", "median", "merge K" — three problems, one data structure.',
a:`<ul>
<li><b>Top K largest.</b> Keep a <em>min</em>-heap of size K. Counter-intuitive and always asked: you pop the smallest, so what remains is the K largest. O(n log k), which beats sorting when k is small.</li>
<li><b>Merge K sorted lists.</b> A heap holding the current head of each list. O(N log k).</li>
<li><b>Median from a data stream.</b> Two heaps — a max-heap of the lower half, a min-heap of the upper half, kept balanced within one element. The median is a heap top or the average of two. This is the classic hard-flavoured question and it is entirely learnable.</li>
</ul>`,
code:[{label:'two heaps — median of a stream',code:`class MedianFinder {
  lo = new MaxHeap()   <span class="c">// lower half</span>
  hi = new MinHeap()   <span class="c">// upper half</span>

  add(x) {
    this.lo.push(x)
    this.hi.push(this.lo.pop())              <span class="c">// funnel through, keeps order correct</span>
    if (this.hi.size &gt; this.lo.size) this.lo.push(this.hi.pop())
  }
  median() {
    return this.lo.size &gt; this.hi.size
      ? this.lo.peek()
      : (this.lo.peek() + this.hi.peek()) / 2
  }
}`}],
after:`<p>JavaScript has no built-in heap, so <b>write one before the interview</b> and know it cold — sift-up, sift-down, and the array-as-tree indexing (<code>parent = (i-1) &gt;&gt; 1</code>, children <code>2i+1</code>, <code>2i+2</code>). Spending fifteen of your forty minutes writing a heap from scratch is how this round is lost.</p>
<p><b>Practise:</b> Kth Largest Element · Top K Frequent · Merge K Sorted Lists · Find Median from Data Stream · Task Scheduler · Reorganize String.</p>`,
fu:['Could you do Top K without a heap? (Quickselect, O(n) average.)','What if the stream is infinite and you need a sliding-window median?']
},
{
q:'Dynamic programming beyond Climbing Stairs',
test:'DP is where "medium" candidates and "hard" candidates separate. The bar is recognising the state, not memorising solutions.',
a:`<p>Every DP question is three decisions: <b>what is the state</b>, <b>what is the transition</b>, <b>what is the base case</b>. Get the state right and the rest usually falls out. The recognisable families:</p>
<div class="table-scroll"><table>
<thead><tr><th>Family</th><th>State</th><th>Canonical problems</th></tr></thead>
<tbody>
<tr><td>1-D linear</td><td><code>dp[i]</code> = best answer ending at or up to i</td><td>House Robber · Climbing Stairs · Decode Ways · Longest Increasing Subsequence</td></tr>
<tr><td>2-D on two strings</td><td><code>dp[i][j]</code> = answer for prefixes of length i and j</td><td>Edit Distance · Longest Common Subsequence · Distinct Subsequences</td></tr>
<tr><td>Knapsack</td><td><code>dp[i][capacity]</code></td><td>Coin Change · Partition Equal Subset Sum · Target Sum</td></tr>
<tr><td>Interval</td><td><code>dp[i][j]</code> = answer for the range i…j</td><td>Burst Balloons · Matrix Chain · Longest Palindromic Substring</td></tr>
<tr><td>State machine</td><td><code>dp[i][holding?]</code></td><td>Best Time to Buy and Sell Stock with cooldown / fee / k transactions</td></tr>
<tr><td>DP on grids</td><td><code>dp[r][c]</code></td><td>Unique Paths · Minimum Path Sum · Maximal Square</td></tr>
</tbody></table></div>`,
code:[{label:'edit distance — the 2-D template worth knowing by heart',code:`function editDistance(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({length:m+1}, () =&gt; new Array(n+1).fill(0))

  for (let i = 0; i &lt;= m; i++) dp[i][0] = i     <span class="c">// delete everything</span>
  for (let j = 0; j &lt;= n; j++) dp[0][j] = j     <span class="c">// insert everything</span>

  for (let i = 1; i &lt;= m; i++)
    for (let j = 1; j &lt;= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j-1],   <span class="c">// replace</span>
                       dp[i-1][j],     <span class="c">// delete</span>
                       dp[i][j-1])     <span class="c">// insert</span>
  return dp[m][n]
}
<span class="c">// O(mn) time, O(mn) space — then say: "this rolls to O(n) space,</span>
<span class="c">// because row i only depends on row i-1"</span>`}],
after:`<p><b>The method that works in the room</b>, and say it out loud in this order: write the brute-force recursion first → identify the repeated subproblem → memoise it (top-down) → only then convert to a table (bottom-up) if they ask. Jumping straight to a table is how people freeze. Memoised recursion is a complete, acceptable answer.</p>`,
fu:['Reduce the space to O(n).','Now reconstruct the actual sequence of edits, not just the count.','Why is this not greedy?']
},
{
q:'Tries, backtracking, and monotonic stacks',
test:'The three remaining shapes that account for most of the rest.',
a:`<p><b>Trie</b> — prefix problems. Autocomplete, word search in a grid, "does any word start with", longest common prefix, and the surprisingly common XOR-maximum trick with a binary trie. Node is <code>{ children: Map, isWord: boolean }</code>; insert and search are both O(word length).</p>
<p><b>Backtracking</b> — build a candidate, recurse, undo. One template covers permutations, combinations, subsets, N-Queens, Sudoku and Word Search. The two scoring details are <b>pruning early</b> and <b>handling duplicates</b> (sort first, then skip <code>i &gt; start &amp;&amp; nums[i] === nums[i-1]</code>).</p>`,
code:[{label:'backtracking — the template',code:`function subsets(nums) {
  const out = [], cur = []
  ;(function go(start) {
    out.push([...cur])                <span class="o">// copy — pushing cur pushes a reference</span>
    for (let i = start; i &lt; nums.length; i++) {
      cur.push(nums[i])
      go(i + 1)
      cur.pop()                       <span class="c">// undo — this is the "backtrack"</span>
    }
  })(0)
  return out
}`},
{label:'monotonic stack — next greater element',code:`function nextGreater(nums) {
  const res = new Array(nums.length).fill(-1)
  const st = []                       <span class="c">// holds INDICES, decreasing values</span>
  for (let i = 0; i &lt; nums.length; i++) {
    while (st.length &amp;&amp; nums[st[st.length-1]] &lt; nums[i]) res[st.pop()] = nums[i]
    st.push(i)
  }
  return res
}
<span class="c">// O(n) — each index is pushed once and popped once</span>`}],
after:`<p><b>Monotonic stack</b> is the one people never recognise. The signal is "next/previous greater or smaller element", and it unlocks Daily Temperatures, Largest Rectangle in Histogram, Trapping Rain Water and Sum of Subarray Minimums — all of which look hard and are the same six lines. Its sibling, the monotonic <em>deque</em>, does Sliding Window Maximum in O(n).</p>`,
fu:['Largest Rectangle in Histogram — walk me through it.','How do you handle duplicates in a permutation problem?','What is the space complexity of your recursion?']
},
{
q:'Binary search on the answer',
test:'The most under-recognised technique. It turns "find the minimum X such that…" from hard into medium.',
a:`<p>When the answer is a number in a range, and you can <em>check</em> a candidate answer in linear time, and the check is <b>monotonic</b> (if X works then X+1 works), you can binary search the answer space instead of the array.</p>`,
code:[{label:'Koko eating bananas — the canonical one',code:`function minSpeed(piles, hours) {
  const can = (k) =&gt; piles.reduce((h, p) =&gt; h + Math.ceil(p / k), 0) &lt;= hours

  let lo = 1, hi = Math.max(...piles)
  while (lo &lt; hi) {
    const mid = (lo + hi) &gt;&gt; 1
    if (can(mid)) hi = mid       <span class="o">// mid works — it might be the answer, keep it</span>
    else lo = mid + 1
  }
  return lo
}
<span class="c">// O(n log(max)) — the log is over the ANSWER range, not the input</span>`}],
after:`<p>The template detail worth drilling: <code>while (lo &lt; hi)</code> with <code>hi = mid</code> and <code>lo = mid + 1</code> converges without an off-by-one and needs no post-loop adjustment. Practise it until you never have to think about the boundary again — boundary bugs under time pressure are how this round is actually lost.</p>
<p><b>Practise:</b> Koko Eating Bananas · Capacity to Ship Packages · Split Array Largest Sum · Minimise Max Distance · Median of Two Sorted Arrays (the genuinely hard one).</p>`,
fu:['How do you know the predicate is monotonic?','Median of Two Sorted Arrays in O(log(m+n)).']
},
{
q:'The eight-week plan',
test:'Realism. Three days of cramming does not move this bar and the attempt wastes the attempt.',
a:`<div class="table-scroll"><table>
<thead><tr><th>Weeks</th><th>Focus</th><th>Volume</th></tr></thead>
<tbody>
<tr><td class="n">1–2</td><td>Arrays, hashing, two pointers, sliding window, binary search — including binary search on the answer</td><td>~40 problems</td></tr>
<tr><td class="n">3–4</td><td>Stacks and monotonic stacks, linked lists, trees, BST, heaps. Write your own heap.</td><td>~40 problems</td></tr>
<tr><td class="n">5–6</td><td>Graphs: BFS, DFS, topological sort, union-find, Dijkstra</td><td>~35 problems</td></tr>
<tr><td class="n">7–8</td><td>DP across all six families, plus backtracking and tries</td><td>~40 problems</td></tr>
</tbody></table></div>
<p>Around 150 problems, done properly. <b>Properly</b> means: attempt for 25 minutes, then read the solution rather than grinding for two hours; write it yourself from scratch afterwards; and <b>redo it a week later from memory</b>. That last step is the one everybody skips and it is where the retention actually comes from.</p>
<p>Four focused hours a week beats twenty unfocused ones. And do the last three weeks with a timer and a whiteboard, out loud, because solving in an IDE in silence trains a different skill than the one being tested.</p>`,
note:`<p>You have a genuine advantage here that most candidates do not: <b>your own DSA track — 34 chapters and 245 exercises.</b> You wrote it. Working through your own material is faster than any external list, and it is already structured the way you think. Start there.</p>`
},
{
q:'How to run a hard you have never seen',
test:'This is what the hard round actually measures — you are not expected to know it.',
a:`<p>They chose a problem you have not seen on purpose. The score is not "solved / did not solve"; it is how far you got and how you moved.</p>
<ol>
<li><b>Restate it and give one concrete example</b> with real numbers. Confirm the example's expected output with them. Roughly a third of failures are solving a slightly different problem.</li>
<li><b>Say the brute force and its complexity</b> within three minutes. You now have a working answer on the board and the pressure drops.</li>
<li><b>Name what is redundant.</b> "I am recomputing the same range" → prefix sums or DP. "I am re-scanning for something I already saw" → hash map. "The input is sorted and I am not using it" → two pointers or binary search. <b>Say these out loud</b>; interviewers give hints to people who are visibly close.</li>
<li><b>Ask for a hint at the twenty-minute mark</b> if you are stuck. It costs a little. Twenty-five minutes of silence costs the round.</li>
<li><b>Code the best idea you have, even if suboptimal</b>, then dry-run it on your example. Working and O(n²) beats elegant and unfinished — every time.</li>
</ol>
<p>The trap to avoid: recognising the problem, half-remembering the clever solution, and trying to reproduce it from memory. That fails badly and visibly. Derive it, out loud, from the brute force — even if you know the trick, walking there is what gets scored.</p>`
}
]},
{
id:'s2', code:'50L', navTitle:'Distributed systems', lv:2,
title:'Distributed systems design',
meta:[['Length','60 min, sometimes twice'],['Who','Staff or principal'],['Bar','Trade-offs with numbers'],['Fail mode','Designing a monolith with more boxes']],
tiers:[['saas',1],['product',1]],
intro:'The R8 designs test whether you can build a system. These test whether you understand what breaks when the system is spread across machines that fail independently and cannot agree on what time it is. This is the largest single knowledge gap between where you are and the ₹50L bar — and unlike brand, it is entirely closeable by study.',
qs:[
{
q:'Capacity estimation — do this before you draw anything',
test:'Whether you size a system or just name components. Skipping this is the fastest way to look junior in a senior round.',
a:`<p>Four numbers, ninety seconds, out loud. Nobody is checking your arithmetic — they are checking that you reason from load to architecture instead of pattern-matching to a diagram.</p>`,
code:[{label:'the back-of-envelope, worked',code:`<span class="c">// "Design a feed for 100M daily active users"</span>

Reads:   100M DAU x 20 feed loads/day = 2B reads/day
         2B / 86,400s ~= 23,000 QPS average
         peak ~= 3x average ~= 70,000 QPS          <span class="o">// always state a peak factor</span>

Writes:  100M x 0.1 posts/day = 10M writes/day ~= 120 QPS
         read:write ratio ~= 200:1                 <span class="o">// THIS drives the design</span>

Storage: 10M posts/day x 1KB = 10GB/day ~= 3.6TB/year
         + media, which dominates: 1M images/day x 500KB = 500GB/day

Memory:  cache the hot 20% of the feed
         100M users x 1KB of feed ids x 0.2 = 20GB  <span class="c">// fits in Redis, comfortably</span>`}],
after:`<p>The numbers worth memorising because you will use them every time: 100,000 seconds in a day (86,400, round it); 1 million QPS is enormous, 10,000 QPS is a normal large service; a single Postgres box does roughly 5,000–20,000 simple QPS; a Redis node does 100,000+; disk seek about 10ms, SSD read about 100µs, memory read about 100ns, same-datacentre round trip about 0.5ms, cross-continent about 150ms.</p>
<p>Then say the sentence that turns numbers into a design: <b>"a 200:1 read-to-write ratio means I should do the expensive work on write and keep reads dumb"</b> — which is exactly the fan-out decision two questions down.</p>`,
fu:['Where did the 3x peak factor come from?','What if this grows 10x next year?','Which of those numbers would you actually measure first?']
},
{
q:'CAP, PACELC, and the consistency models',
test:'The vocabulary of this round. Getting CAP subtly wrong is a very common and very visible mistake.',
a:`<p><b>CAP, stated correctly:</b> when a network <em>partition</em> occurs, you must choose between consistency and availability. That is all it says. It is not "pick two of three" — partitions are not optional, they happen, so you are really choosing CP or AP. When there is no partition you get both, which is why the theorem is less useful than people think.</p>
<p><b>PACELC</b> is the more honest version and worth naming: if there is a <b>P</b>artition, choose <b>A</b>vailability or <b>C</b>onsistency; <b>E</b>lse (normal operation), choose <b>L</b>atency or <b>C</b>onsistency. That second half is the trade-off you actually make every day — synchronous replication costs latency, asynchronous replication costs consistency.</p>
<div class="table-scroll"><table>
<thead><tr><th>Consistency model</th><th>Guarantee</th><th>Where you would accept it</th></tr></thead>
<tbody>
<tr><td><b>Strong / linearizable</b></td><td>Every read sees the latest write, globally ordered</td><td>Account balance, inventory at checkout, anything involving money</td></tr>
<tr><td><b>Sequential</b></td><td>All nodes see operations in the same order, not necessarily real-time</td><td>Replicated state machines</td></tr>
<tr><td><b>Causal</b></td><td>Causally related operations are ordered; concurrent ones may differ</td><td>Comment threads — a reply must never appear before its parent</td></tr>
<tr><td><b>Read-your-writes</b></td><td>You always see your own changes</td><td>Profile edits, "post appears immediately for the author". The minimum users notice.</td></tr>
<tr><td><b>Eventual</b></td><td>Replicas converge, eventually</td><td>Like counts, view counts, follower counts, search indexes</td></tr>
</tbody></table></div>`,
after:`<p>The practical answer that scores: <em>"I would not pick one model for the whole system. The balance is linearizable, the like count is eventual, and the user's own profile needs read-your-writes. Consistency is chosen per data type, not per database."</em></p>
<p>And the concrete mechanism for read-your-writes, because they will ask: after a write, pin that user's reads to the primary for a few seconds, or carry the write's log position in a token and have the replica wait until it has caught up to it.</p>`,
fu:['Give me a real example of losing read-your-writes.','Is Postgres with async replicas CP or AP?','What is a quorum read and write, and what does R + W > N give you?']
},
{
q:'Consistent hashing — why the naive approach fails',
test:'Asked verbatim at this level. The answer is short and the "why" is the whole thing.',
a:`<p>The naive shard key is <code>hash(key) % N</code>. Add or remove one node and N changes, so <b>almost every key remaps</b> — with 4 nodes going to 5, roughly 80% of your cache is invalidated at once, which usually means the database falls over.</p>
<p><b>Consistent hashing</b> puts both nodes and keys on a ring of hash values. A key belongs to the first node clockwise from it. Adding a node only steals keys from its immediate neighbour, so on average only <code>1/N</code> of keys move.</p>`,
code:[{code:`ring:   0 ─── A ───── B ─────── C ─── (wraps to 0)
        key k hashes here ─┘  → owned by B

<span class="c">// add node D between A and B:</span>
        0 ─── A ── D ── B ─────── C ───
<span class="c">// only keys between A and D move, and only from B. Everything else stays put.</span>`}],
after:`<p><b>Virtual nodes</b> are the part people forget and the part that makes it actually work: with only N points on the ring the distribution is lumpy and removing a node dumps its entire load onto one neighbour. So each physical node gets 100–200 virtual positions, which smooths distribution and spreads a failed node's load across all survivors.</p>
<p>Where you have met it without knowing: Cassandra and DynamoDB partitioning, Memcached client-side sharding, and load balancers doing sticky routing.</p>`,
fu:['How do you handle a hot key that consistent hashing cannot help with?','What happens to replicas on the ring?','How would you rebalance without downtime?']
},
{
q:'Sharding — choosing the key, and living with the choice',
test:'The shard key is the most expensive decision in the system and the hardest to change later.',
a:`<div class="table-scroll"><table>
<thead><tr><th>Strategy</th><th>Good</th><th>Bad</th></tr></thead>
<tbody>
<tr><td><b>Range</b> (by date, by id range)</td><td>Range queries are cheap; easy to reason about</td><td>Hotspots — all new writes land on the newest shard. Sharding by <code>created_at</code> is the classic mistake.</td></tr>
<tr><td><b>Hash</b> (by user id)</td><td>Even distribution</td><td>Range queries must fan out to every shard</td></tr>
<tr><td><b>Directory</b> (a lookup service)</td><td>Total flexibility; can move individual tenants</td><td>The directory is now a dependency and a single point of failure</td></tr>
<tr><td><b>Geographic</b></td><td>Latency and data-residency compliance</td><td>Uneven load; cross-region queries are painful</td></tr>
</tbody></table></div>
<p><b>The questions that separate people who have done this from people who have read about it:</b></p>
<ul>
<li><b>Cross-shard joins.</b> They effectively do not exist. You either denormalise, or you fetch and join in the application, or you keep related data on the same shard by choosing the key so it co-locates.</li>
<li><b>Cross-shard transactions.</b> Also effectively gone — which is what the saga question below is for.</li>
<li><b>Resharding.</b> Doubling shard count is far easier than going from 3 to 5, because each shard splits cleanly in two. Plan for powers of two, or use logical shards: create 1,024 logical shards up front and map many onto each physical node, so growing is a remapping rather than a rehash.</li>
<li><b>The celebrity problem.</b> One user with 50 million followers breaks any key-based scheme. It gets special-cased — and that is the correct answer, not a failure of the design.</li>
</ul>`,
fu:['Which key would you choose for a chat application?','How do you run a migration across 100 shards?','What is a logical shard?']
},
{
q:'Distributed transactions — 2PC vs saga',
test:'The single most likely deep-dive if you say the word "microservices".',
a:`<p><b>Two-phase commit:</b> a coordinator asks every participant to prepare, and if all say yes, tells them all to commit. It gives you real atomicity — and it is rarely used, for a good reason worth stating: it is a <b>blocking</b> protocol. If the coordinator dies after the prepare phase, every participant holds its locks indefinitely, waiting. In practice that means an outage.</p>
<p><b>Saga:</b> a sequence of local transactions, each with a <b>compensating action</b> that semantically undoes it. No distributed locks, no global atomicity — you get eventual consistency and you must design the undo path.</p>`,
code:[{label:'a booking saga, and the part people forget',code:`reserve seat    →  charge card    →  send confirmation
     |                  |
     |                  └─ fails → compensate: release seat
     └─ fails → nothing to undo, return 409

<span class="c">// compensation is NOT a rollback — it is a new forward action.</span>
<span class="c">// You cannot un-charge a card; you issue a refund, which is</span>
<span class="c">// visible to the user and appears on their statement.</span>
<span class="c">// That business consequence is the real cost of a saga.</span>`}],
after:`<p>Two flavours worth naming: <b>choreography</b> (each service listens for events and reacts — no coordinator, but the flow is scattered across services and hard to follow) and <b>orchestration</b> (a single saga coordinator drives the steps — easier to reason about, monitor and debug, at the cost of a component that knows the whole flow). At six services, orchestration is almost always the right call, and saying so with that reasoning is a strong answer.</p>
<p>And the related pattern they may fish for: the <b>outbox</b>. Writing to your database and publishing to Kafka are two systems and cannot be atomic — so you write the event into an <code>outbox</code> table in the <em>same</em> transaction as the business change, and a separate relay publishes from that table. That is how you avoid the "committed the order but never published the event" bug.</p>`,
fu:['What if a compensating action itself fails?','How do you make a saga step idempotent?','What is the outbox pattern solving exactly?']
},
{
q:'Exactly-once delivery — and why it does not exist',
test:'A trick question with a specific correct answer. Claiming exactly-once delivery marks you immediately.',
a:`<p><b>Exactly-once <em>delivery</em> is impossible</b> over an unreliable network. The sender cannot distinguish "message lost" from "acknowledgement lost", so it either retries (risking duplicates) or does not (risking loss). Every system that advertises exactly-once is really doing <b>at-least-once delivery plus idempotent processing</b>, which produces exactly-once <em>effects</em>. That distinction is the answer.</p>
<p><b>At-most-once:</b> fire and forget. Fine for metrics, never for money.<br>
<b>At-least-once:</b> retry until acknowledged. The default, and it means your consumer <em>will</em> see duplicates.<br>
<b>Effectively-once:</b> at-least-once plus deduplication on a stable key.</p>`,
code:[{label:'the idempotent consumer',code:`async function handle(event) {
  <span class="c">// the dedupe key must come from the PRODUCER and be stable across retries</span>
  const first = await db.processed.insert({ id: event.id })
    .catch(e =&gt; e.code === 'UNIQUE_VIOLATION' ? null : Promise.reject(e))
  if (!first) return                       <span class="o">// already handled, ack and move on</span>

  await doTheWork(event)                   <span class="c">// same transaction, ideally</span>
}`}],
after:`<p>Three details that show real experience: the dedupe key must be generated by the producer, not the broker, or a producer retry creates a new id and defeats it; the dedupe table needs a retention policy or it grows forever; and if the work and the dedupe insert are not in one transaction there is a window where you can crash between them — which is why the natural business key (an order id, an idempotency key) is better than a separate table when you can use it.</p>`,
fu:['What does Kafka mean by exactly-once semantics then?','How long do you keep dedupe keys?','What if the work is calling a third-party API that is not idempotent?']
},
{
q:'Kafka — partitions, ordering, consumer groups, rebalance',
test:'If you say "event-driven", this follows. It is also the concrete gap your resume has.',
a:`<p>A topic is split into <b>partitions</b>; each partition is an ordered, append-only log. <b>Ordering is guaranteed within a partition and nowhere else</b> — that single sentence is most of the marks, and it drives everything else.</p>
<ul>
<li><b>The partition key decides ordering.</b> Key by <code>userId</code> and all events for one user land on one partition and stay ordered. Key randomly and you get even distribution and no ordering at all. This is the design decision.</li>
<li><b>A consumer group</b> gets each message once; within a group, one partition is owned by exactly one consumer. So <b>partition count is your maximum parallelism</b> — 10 partitions means at most 10 useful consumers, and the eleventh sits idle.</li>
<li><b>Offsets</b> are the consumer's bookmark. Commit after processing for at-least-once; commit before for at-most-once. There is no third option.</li>
<li><b>Rebalance</b> is the operational pain: when a consumer joins, leaves or times out, partitions are reassigned and the whole group pauses. A slow consumer that exceeds <code>max.poll.interval.ms</code> gets kicked out, triggering a rebalance, which slows everyone — a classic cascading failure.</li>
<li><b>Retention</b> is time or size based, not consumption based. Messages stay after being read, which is what makes replay possible and is the real difference from a queue.</li>
</ul>`,
after:`<p><b>Queue vs log, stated crisply:</b> a queue (SQS, RabbitMQ, BullMQ) distributes work — a message goes to one consumer and is then gone. A log (Kafka) retains an ordered history that many independent consumer groups read at their own offsets. Choose Kafka when you need replay, ordering, or several unrelated systems consuming the same stream. Choose a queue for background jobs. Using Kafka as a job queue is the most common over-engineering at this level, and saying that out loud is a point in your favour.</p>`,
fu:['How do you handle a poison message?','What happens if you need to increase partitions later? (Ordering by key breaks for existing keys.)','How would you do a schema change on an event?']
},
{
q:'Design a chat system at scale',
test:'The most common ₹50L design question. It touches connections, ordering, fan-out and storage all at once.',
a:`<p><b>Scope first:</b> one-to-one and group messages, delivery and read receipts, online presence, message history, push when offline. Exclude voice, video and end-to-end encryption unless asked.</p>
<p><b>Connections.</b> WebSockets, one persistent connection per device. At 10 million concurrent connections and roughly 50–100k connections per gateway node, that is 100–200 gateway nodes. The gateway is stateful — it knows which sockets it holds — so you need a <b>session registry</b> in Redis mapping <code>userId → gatewayNodeId</code>, so a message for user B can be routed to the node holding B's socket.</p>
<p><b>Sending a message.</b> Client → gateway → message service → persist → route to recipient's gateway → push down the socket. If the recipient is offline, hand off to the push notification service. Persist <em>before</em> acknowledging, or a crash loses a message the sender believes was sent.</p>
<p><b>Ordering</b> is the subtle part. Wall-clock timestamps from clients are unreliable — clocks skew. Use a per-conversation monotonic sequence number assigned server-side, or a Snowflake-style id that is time-sortable and globally unique. Then the client sorts by that, not by <code>Date.now()</code>.</p>
<p><b>Storage.</b> Extremely write-heavy, always read by conversation, almost never updated — that shape points at Cassandra or DynamoDB with a partition key of <code>conversationId</code> and a clustering key of the sequence number, so "the last 50 messages in this conversation" is one sequential read.</p>`,
after:`<p><b>Group messages</b> are the fan-out decision: for a 10-person group, write to all 10 inboxes. For a 100,000-member channel, that is 100,000 writes per message — so large groups switch to fan-out-on-read, where members pull from a shared conversation log. Naming that threshold explicitly is exactly the kind of trade-off this round rewards.</p>
<p><b>Presence</b> is the sneaky scale problem: naive presence means every status change is broadcast to every contact, which is O(users × contacts) and will dominate your traffic. The real answers are a heartbeat with a TTL in Redis, and only pushing presence for conversations the user currently has open.</p>`,
fu:['How do you guarantee a message is not lost if the gateway crashes mid-send?','How do read receipts work for a group of 500?','How would you add end-to-end encryption, and what breaks? (Server-side search.)']
},
{
q:'Design a news feed — the fan-out decision',
test:'The canonical read-heavy design, and a clean test of whether you reason from the read:write ratio.',
a:`<p>Everything follows from the 200:1 read-to-write ratio you computed at the start.</p>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Fan-out on write (push)</th><th>Fan-out on read (pull)</th></tr></thead>
<tbody>
<tr><td>How</td><td>On posting, write the post id into every follower's precomputed feed list</td><td>On opening the feed, query the people you follow and merge their recent posts</td></tr>
<tr><td>Read</td><td>One cheap read of a ready list. Fast.</td><td>Expensive fan-in and merge on every open</td></tr>
<tr><td>Write</td><td>Expensive — one write per follower</td><td>Cheap</td></tr>
<tr><td>Breaks on</td><td>Celebrities. 50M followers = 50M writes for one post.</td><td>Users following thousands of accounts</td></tr>
</tbody></table></div>
<p><b>The real answer is hybrid</b>, and this is what they are waiting for: fan-out on write for normal accounts, and for accounts above a follower threshold, do not fan out — merge their posts in at read time. Twitter's actual design, and it is the correct answer because it puts each strategy where its cost is lowest.</p>`,
after:`<p>Store the feed as a capped list of post ids in Redis (say the newest 800), not the post bodies — hydrate the bodies from a cache or the database at read time, so an edited or deleted post does not need rewriting across millions of feed lists.</p>`,
fu:['What happens when someone follows 5,000 accounts?','How do you handle a deleted post that is already in a million feeds?','Where does ranking fit into this?']
},
{
q:'Design a payment system',
test:'Where correctness matters more than scale. A good answer here is worth two ordinary ones.',
a:`<p>The framing that sets the tone: <em>"this is the one system where I will trade availability and latency for consistency without hesitating."</em></p>
<ul>
<li><b>Double-entry ledger, append-only.</b> Every transaction is two entries that sum to zero — debit one account, credit another. Balances are derived from the ledger, never stored as a mutable field you increment. This makes every balance auditable and makes a lost update impossible by construction.</li>
<li><b>Idempotency everywhere.</b> An idempotency key on every payment request, unique-indexed. A retry returns the original result rather than charging again.</li>
<li><b>State machine, explicitly.</b> <code>initiated → authorised → captured → settled</code>, with <code>failed</code> and <code>refunded</code> as terminal states. Only legal transitions allowed, enforced in the database rather than in the application.</li>
<li><b>Webhooks plus reconciliation.</b> Confirm on the provider's webhook, verify its signature, and dedupe on the provider's event id. Then run a scheduled job that queries the provider for anything still pending past its window — because webhooks are lost, and reconciliation is how real payment systems stay correct.</li>
<li><b>Money as integer minor units.</b> Never a float. Store the currency alongside every amount.</li>
<li><b>Exactly-once effects via the saga above</b>, with refund as the compensating action, and the human consequence acknowledged.</li>
</ul>`,
after:`<p>If they push on scale: payments are usually low-QPS and high-stakes, so the interesting scaling problem is not throughput but <b>the ledger growing forever</b> — which is solved with periodic balance snapshots so you never replay the whole history, plus partitioning by account and archiving cold periods.</p>`,
fu:['What if the provider says success but your database write fails?','How do you handle a partial refund?','How would you detect a double charge after the fact?']
},
{
q:'Observability and reliability at this level',
test:'The gap the scouting report flagged. At ₹50L, "we have logs" is not an answer.',
a:`<p><b>The three pillars, and what each is actually for:</b> metrics tell you <em>something is wrong</em> (cheap, aggregate, alertable); traces tell you <em>where</em> (per-request, sampled, expensive); logs tell you <em>why</em> (detailed, most expensive to store). Alert on metrics, diagnose with traces, confirm with logs — in that order.</p>
<p><b>SLI, SLO, error budget</b> — the vocabulary of this round:</p>
<ul>
<li><b>SLI</b> — the measurement. "Proportion of requests served under 300ms."</li>
<li><b>SLO</b> — the target. "99.9% over 30 days."</li>
<li><b>Error budget</b> — what 99.9% permits: about 43 minutes of failure per month. <b>The budget is the point.</b> It converts reliability from an argument into arithmetic: budget remaining means you can ship risky changes, budget spent means you stop feature work and fix reliability. Being able to explain that trade-off is a staff-level signal.</li>
</ul>
<p><b>Alert on symptoms, not causes.</b> Page on "checkout error rate above 1%" — a user-visible symptom — not on "CPU above 80%", which may be entirely fine. Every alert that does not require a human to act on it immediately should be a dashboard instead, because alert fatigue is how real outages get missed.</p>`,
after:`<p>Also know: <b>p99 over average</b>, always — an average hides the tail, and the tail is what users actually complain about. <b>Percentiles do not average</b> across services, so you aggregate histograms, not percentiles. And the <b>four golden signals</b> — latency, traffic, errors, saturation — which is the shortest correct answer to "what would you monitor?"</p>`,
fu:['Your p99 is bad but p50 is fine. Where do you look?','How do you decide what to sample in tracing?','What goes in a runbook?']
}
]},
{
id:'s3', code:'50L', navTitle:'Runtime internals', lv:2,
title:'Runtime internals',
meta:[['Length','Folded into the deep dive'],['Who','Staff engineer'],['Bar','Below the framework'],['Fail mode','Knowing the API, not the machine']],
tiers:[['saas',1],['product',1]],
intro:'At ₹20–28L nobody asks how V8 stores an object. At the top of the band they do, because at that level you are expected to debug things the framework cannot explain. This round is finite and learnable — perhaps two weekends of reading — and it is disproportionately impressive because most candidates have never looked.',
qs:[
{
q:'How does V8 execute your JavaScript?',
test:'Whether you know why some JavaScript is 100x slower than other JavaScript that looks identical.',
a:`<p>Source → parser → AST → <b>Ignition</b>, the bytecode interpreter, which starts executing immediately. While running, V8 collects type feedback. Functions that run hot get sent to <b>TurboFan</b>, the optimising compiler, which produces machine code specialised to the types it has observed. If a later call violates those assumptions, the code is <b>deoptimised</b> and falls back to bytecode.</p>
<p><b>Hidden classes</b> (V8 calls them Maps) are the mechanism underneath. Objects with the same properties added in the same order share a hidden class, which lets property access compile to a fixed memory offset instead of a hash lookup. <b>Inline caches</b> then remember "at this call site, the object had hidden class X, so the property is at offset 4" — and that is what makes property access fast.</p>`,
code:[{label:'why these two are not the same speed',code:`<span class="c">// SAME hidden class — monomorphic call site, fast</span>
function P(x, y) { this.x = x; this.y = y }
const a = new P(1, 2), b = new P(3, 4)

<span class="c">// DIFFERENT hidden classes — property order differs</span>
const c = { x: 1 }; c.y = 2
const d = { y: 2 }; d.x = 1
<span class="c">// a function reading .x from both goes polymorphic, then megamorphic,</span>
<span class="c">// and the inline cache stops helping entirely</span>

<span class="c">// also deoptimising: adding a property after construction,</span>
<span class="c">// deleting a property (delete o.x), and mixing types in an array</span>
const arr = [1, 2, 3]      <span class="c">// PACKED_SMI — fastest element kind</span>
arr.push(1.5)              <span class="c">// → PACKED_DOUBLE</span>
arr.push('x')              <span class="c">// → PACKED_ELEMENTS, boxed, slow</span>
arr[100] = 1               <span class="c">// → HOLEY, slower still, and it never goes back</span>`}],
after:`<p>The practical rules that follow, which is what they actually want: initialise all properties in the constructor and in the same order; never <code>delete</code> a property (set it to <code>null</code> or <code>undefined</code>); keep arrays type-homogeneous and hole-free; and prefer monomorphic functions — one that receives four different object shapes is far slower than four specialised ones.</p>`,
fu:['What is a megamorphic call site?','Why is delete so expensive?','How would you actually verify any of this? (--trace-deopt, --allow-natives-syntax.)']
},
{
q:'Garbage collection, and how you find a leak',
test:'Directly relevant to a long-running Node service, and a real staff-level debugging skill.',
a:`<p>V8's heap is <b>generational</b>, on the observation that most objects die young.</p>
<ul>
<li><b>Young generation (nursery).</b> Collected by <b>Scavenger</b>, a copying collector: live objects are copied to the other semi-space and everything else is discarded wholesale. Frequent, very fast, pauses of well under a millisecond. An object that survives two scavenges is promoted.</li>
<li><b>Old generation.</b> Collected by <b>mark-sweep-compact</b>: mark what is reachable from the roots, sweep the rest, compact to remove fragmentation. Much less frequent, much more expensive. Modern V8 does most of the marking concurrently and incrementally to keep pauses short, but a major GC on a large heap is still measured in tens of milliseconds.</li>
</ul>
<p><b>The key insight:</b> allocating a lot of short-lived objects is cheap — that is what the nursery is for. Allocating objects that <em>survive</em> is expensive, because they get promoted and then cost you major GCs. So the performance problem is rarely "too many allocations"; it is "too many long-lived allocations".</p>`,
code:[{label:'the leak-hunting workflow, which is the real answer',code:`<span class="c">// 1. confirm it is a leak, not just a large heap</span>
node --expose-gc app.js
process.memoryUsage()   <span class="c">// heapUsed climbing across forced GCs = a real leak</span>

<span class="c">// 2. three heap snapshots: baseline, after load, after more load</span>
<span class="c">//    Chrome DevTools → Memory → Comparison view</span>
<span class="c">//    look at "Delta" — what keeps growing between snapshots?</span>

<span class="c">// 3. select the growing constructor → Retainers panel</span>
<span class="c">//    the retainer chain names the thing holding it alive.</span>
<span class="c">//    In Node it is almost always one of four things:</span>
<span class="c">//      - an event listener never removed</span>
<span class="c">//      - a Map or array used as a cache with no eviction</span>
<span class="c">//      - a closure capturing a request context</span>
<span class="c">//      - a timer that was never cleared</span>`}],
after:`<p>The fixes map one to one: remove listeners on cleanup or use <code>once</code>; give every in-memory cache a size bound and a TTL, or use a <code>WeakMap</code> keyed by an object whose lifetime you do not control; clear timers; and in production, expose heap metrics so you see the sawtooth flatten into a ramp before it becomes an out-of-memory crash.</p>`,
fu:['What is the difference between a memory leak and high memory usage?','Why is a WeakMap the right cache key sometimes?','What does --max-old-space-size actually change?']
},
{
q:'The browser rendering pipeline, and what triggers each stage',
test:'The frontend half of internals. It is what separates "I used a CSS transition" from "I know why that one janks".',
a:`<p><b>Style → Layout → Paint → Composite.</b> The cost of a change depends entirely on how far up that chain it starts.</p>
<div class="table-scroll"><table>
<thead><tr><th>Change</th><th>Triggers</th><th>Cost</th></tr></thead>
<tbody>
<tr><td><code>width</code>, <code>height</code>, <code>top</code>, <code>margin</code>, <code>font-size</code></td><td>Layout → Paint → Composite</td><td>Most expensive — geometry of other elements may change too</td></tr>
<tr><td><code>color</code>, <code>background</code>, <code>box-shadow</code>, <code>border-radius</code></td><td>Paint → Composite</td><td>Moderate — repaints the affected area</td></tr>
<tr><td><code>transform</code>, <code>opacity</code></td><td class="n">Composite only</td><td>Cheapest — handled on the compositor, often off the main thread entirely</td></tr>
</tbody></table></div>
<p><b>Therefore: animate <code>transform</code> and <code>opacity</code>, never <code>left</code>/<code>top</code>/<code>width</code>.</b> That one rule is the entire practical takeaway, and being able to explain <em>why</em> in terms of the pipeline is what gets scored.</p>`,
code:[{label:'layout thrashing — the classic main-thread killer',code:`<span class="c">// BAD: read, write, read, write — forces a synchronous layout every iteration</span>
for (const el of els) {
  el.style.height = el.offsetHeight + 10 + 'px'   <span class="o">// read forces flush of pending writes</span>
}

<span class="c">// GOOD: batch all reads, then all writes</span>
const heights = els.map(el =&gt; el.offsetHeight)    <span class="c">// read phase</span>
els.forEach((el, i) =&gt; el.style.height = heights[i] + 10 + 'px')  <span class="c">// write phase</span>`}],
after:`<p>The properties that force a synchronous layout when read — <code>offsetHeight</code>, <code>getBoundingClientRect</code>, <code>scrollTop</code>, <code>getComputedStyle</code> — are worth memorising, because reading one after a write is what causes the thrash.</p>
<p><b><code>will-change</code></b> promotes an element to its own compositor layer, which makes it cheap to animate — but each layer costs GPU memory, and applying it to everything makes things slower, not faster. Add it just before the animation and remove it after.</p>
<p>And connect it to <b>INP</b> from R4: a long task blocks the main thread, so the next paint after an interaction is delayed. That is why breaking up long tasks (with <code>scheduler.yield()</code> or <code>setTimeout</code>) improves a metric that looks like it should be about rendering.</p>`,
fu:['What is the compositor thread and what can it do without the main thread?','Why is a CSS animation often smoother than a JS one?','How would you find a long task in production?']
},
{
q:'Node internals — libuv, event loop lag, and where the threads are',
test:'Deeper than R5.1. This is the version asked when they suspect you actually know.',
a:`<p><b>Node has four thread pools you should be able to distinguish:</b> the single main thread running your JavaScript; the libuv thread pool (default 4) used by file I/O, DNS via <code>getaddrinfo</code>, zlib and crypto; the V8 threads for concurrent GC and TurboFan compilation; and any <code>worker_threads</code> you create.</p>
<p>Network I/O does <b>not</b> use the thread pool — it uses the operating system's event notification (epoll on Linux, kqueue on BSD, IOCP on Windows), which is why Node handles tens of thousands of sockets on one thread but stalls on four concurrent <code>bcrypt</code> calls.</p>`,
code:[{label:'measuring event loop lag — the metric that finds the problem',code:`<span class="c">// the crude version, good enough to alert on</span>
let last = process.hrtime.bigint()
setInterval(() =&gt; {
  const now = process.hrtime.bigint()
  const lag = Number(now - last) / 1e6 - 100     <span class="c">// expected 100ms interval</span>
  last = now
  metrics.gauge('eventloop.lag_ms', lag)          <span class="o">// &gt;50ms sustained = trouble</span>
}, 100)

<span class="c">// the proper version, built in:</span>
const { monitorEventLoopDelay } = require('node:perf_hooks')
const h = monitorEventLoopDelay({ resolution: 10 })
h.enable()
<span class="c">// h.mean, h.percentile(99) — alert on the p99, not the mean</span>`}],
after:`<p>This is the single most useful Node production metric and almost nobody instruments it. High event loop lag with low CPU means you are blocked on something synchronous; high lag with high CPU means genuine CPU work that belongs on a worker thread or a queue. Being able to say that diagnostic split is a staff-level answer.</p>
<p>Also worth knowing: <code>process.nextTick</code> has its own queue that drains before promise microtasks and can starve the loop if it recurses; and <code>setImmediate</code> versus <code>setTimeout(fn, 0)</code> is non-deterministic at the top level but deterministic inside an I/O callback, where <code>setImmediate</code> always fires first because the check phase follows poll.</p>`,
fu:['You see 300ms event loop lag in production. Walk me through the diagnosis.','When would you reach for worker_threads over a queue?','What does clustering actually give you and what does it not?']
},
{
q:'The network layer — HTTP/2, HTTP/3, and connection cost',
test:'Performance work at this level goes below the framework. Directly relevant to your page-load claims.',
a:`<ul>
<li><b>HTTP/1.1</b> — one request at a time per connection, so browsers open about six connections per origin. Head-of-line blocking at the application layer, which is why bundling and sprite sheets existed.</li>
<li><b>HTTP/2</b> — multiplexed streams over one connection, header compression (HPACK), server push (now largely deprecated). This is why aggressive bundling became counterproductive: many small cacheable files are now often better than one big one.</li>
<li><b>HTTP/3 / QUIC</b> — runs over UDP. Solves the remaining problem: HTTP/2 still suffered <b>TCP-level</b> head-of-line blocking, where one lost packet stalls every multiplexed stream. QUIC makes streams independent, and adds 0-RTT connection resumption.</li>
</ul>
<p><b>The costs worth quoting:</b> a TCP handshake is one round trip; TLS 1.3 adds one more (TLS 1.2 added two); so a fresh HTTPS connection to a distant origin costs roughly 2 round trips before a single byte of your content moves. At 150ms cross-continent that is 300ms of nothing.</p>
<p>Which explains the fixes: <code>preconnect</code> for origins you will definitely use, keep-alive and connection reuse, and reducing the number of distinct origins — every third-party domain is another handshake.</p>`,
after:`<p>Resource hints, in order of aggressiveness: <code>dns-prefetch</code> (resolve only) → <code>preconnect</code> (resolve, connect, TLS) → <code>preload</code> (fetch this now, high priority, I need it this navigation) → <code>prefetch</code> (fetch idly, I will probably need it next navigation). Misusing <code>preload</code> for everything makes things worse by competing with the LCP resource for bandwidth.</p>`,
fu:['Why did bundling everything become an anti-pattern with HTTP/2?','What is 0-RTT and what is its security caveat? (Replay attacks.)','How does a CDN change any of this?']
}
]},
{
id:'s4', code:'50L', navTitle:'Staff behavioural', lv:2,
title:'Behavioural at staff level',
meta:[['Length','45–60 min, sometimes two'],['Who','Senior EM, director, or a staff peer'],['Bar','Impact beyond your own keyboard'],['Fail mode','Great stories about code you wrote']],
tiers:[['saas',1],['product',1]],
intro:'This round is why strong engineers get levelled down. The stories that win at ₹24L — I built it, I owned it, I shipped it — are the wrong shape here. At staff level they are looking for scope that extends past your own hands: decisions that changed how other people work, and judgement about what not to build.',
qs:[
{
q:'What actually changes in the stories',
test:'Calibration. Same events, different emphasis.',
a:`<div class="table-scroll"><table>
<thead><tr><th>They ask about</th><th>Senior answer</th><th>Staff answer</th></tr></thead>
<tbody>
<tr><td>A project</td><td>What you built and how</td><td>Why it was the right thing to build, what you chose not to build, and how you got others aligned</td></tr>
<tr><td>A conflict</td><td>How you resolved it</td><td>How you changed the decision-making process so that class of conflict stopped recurring</td></tr>
<tr><td>An incident</td><td>How you fixed it</td><td>The systemic change, and how you got other teams to adopt it</td></tr>
<tr><td>Mentoring</td><td>You helped a junior</td><td>You raised the bar for a group — a standard, a review culture, a practice that outlived you</td></tr>
<tr><td>Scope</td><td>Your service</td><td>Several teams, or a decision with a budget attached</td></tr>
</tbody></table></div>
<p><b>The tell they listen for is the pronoun.</b> A senior story is full of "I". A staff story has "I" for the decision and the persuasion, and "we" for the execution — because at that level you are judged on outcomes you could not have produced alone.</p>`,
note:`<p>You have a real staff-level story already and you are probably not telling it: you authored the frontend and API standards that an engineering team now works to. That is influence beyond your own keyboard. Tell it with the parts that matter — how you got people to actually follow them, what you did about the person who disagreed, and how you kept them from decaying.</p>`
},
{
q:'Tell me about a time you influenced without authority.',
test:'The defining staff-level competency. Nobody reports to you and the thing still happened.',
a:`<p>Structure the answer around <b>how you built the case</b>, not how right you were:</p>
<ol>
<li><b>The problem, in their currency.</b> Not "the code is messy" but "we are spending two days a sprint on this and here is the measurement."</li>
<li><b>The evidence.</b> A prototype, a benchmark, an incident count. Data beats opinion, and a working demo beats data.</li>
<li><b>The objections you had to answer</b> — and who raised them. Naming a real sceptic and how you won them over is the most convincing part of any story like this.</li>
<li><b>The outcome, measured.</b></li>
</ol>
<p>Your standards story fits this exactly. So does the Redux to Zustand migration, if you tell it as a persuasion problem rather than a technical one: you had to convince a team to accept a migration cost, and the honest naming of what was lost is what made it credible.</p>`,
trap:`<p>The story where you were right, nobody listened, and it later broke. It answers a different question — it shows you were correct, not that you were persuasive — and at this level being unable to move people is the actual gap they are testing for.</p>`,
fu:['Who disagreed most and why?','What would you do differently if you had to do it again?','How did you know it worked?']
},
{
q:'Tell me about a technical decision that turned out to be wrong.',
test:'Whether you can hold a strong opinion and still update. This gets asked in some form every single time at this level.',
a:`<p>The shape that lands: <b>the decision → the reasoning that was sound at the time → the signal that contradicted it → how long you took to accept it → what you did → the rule you now carry.</b></p>
<p>The part most candidates skip is the fourth: <b>how long you took to accept it.</b> Being honest that you defended it for two weeks before the evidence became undeniable is more credible than a story where you updated instantly, and it demonstrates the thing they are actually probing — whether ego gets in the way of the data.</p>`,
fu:['What was the cost of the delay in changing course?','How do you decide when to reverse versus push through?','Has that rule ever been wrong?']
},
{
q:'How do you decide what NOT to build?',
test:'The clearest staff signal there is. Senior engineers ship; staff engineers also prevent work.',
a:`<p>Have a real framework and a real example. The framework:</p>
<ul>
<li><b>Whose problem is it, and how many people have it?</b> One loud customer is not a product signal.</li>
<li><b>What is the cost of being wrong in each direction?</b> A reversible decision made quickly beats a perfect decision made slowly; an irreversible one deserves the opposite treatment.</li>
<li><b>What does it cost to <em>own</em>, not to build?</b> The build is a few weeks; the maintenance, the on-call surface and the migration cost when it needs replacing are the real bill. This is the argument you already make about not adding a message broker.</li>
<li><b>What does it stop us doing?</b> Opportunity cost is the argument that actually persuades product people, because it is in their language.</li>
</ul>
<p>Then a concrete story: something you argued against, and either won or lost. Losing is fine — "I lost that argument, we built it, and it was retired eighteen months later" is a strong ending, as long as you do not tell it smugly.</p>`,
fu:['Give me an example where you were the one who wanted to build it and were talked down.','How do you say no to a founder?']
},
{
q:'Build versus buy — walk me through one.',
test:'Whether you can reason about cost, risk and time rather than just preference. Engineers over-index on build.',
a:`<p>The factors, in the order that actually decides it:</p>
<ul>
<li><b>Is it core to what makes the business different?</b> Build the differentiator, buy everything else. You do not build an auth provider; you might build a matching engine.</li>
<li><b>Total cost of ownership, not licence cost.</b> Engineer-months to build, plus maintenance forever, plus the on-call burden, versus a subscription. Engineers systematically underestimate the "forever" column by a large factor.</li>
<li><b>Time to value.</b> Six months of building is six months of not shipping the thing customers asked for.</li>
<li><b>Exit cost.</b> How hard is it to leave the vendor in two years? A wrapper layer at the boundary makes a buy decision reversible, and that is often what makes it acceptable.</li>
<li><b>Compliance and data residency</b>, which sometimes decide it outright regardless of the rest.</li>
</ul>
<p>Say the default out loud: <b>buy, unless it is core or the vendor cost scales badly with your growth.</b> Then give the exception you have actually lived.</p>`,
fu:['When did you build something you should have bought?','How would you decide on a vendor with no exit path?']
},
{
q:'The rest of the staff round',
test:'Same six stories from R11, reframed for scope.',
a:`<ul>
<li><b>Tell me about a project you killed.</b> Or should have. What was the sunk-cost pressure and how did you handle it?</li>
<li><b>How do you drive a migration across teams that do not report to you?</b> The real answer involves making the new path easier than the old one, not writing a policy.</li>
<li><b>How do you set technical direction without becoming a bottleneck?</b> Written design docs, a review forum, and defaults that make the right thing easy.</li>
<li><b>Tell me about mentoring someone senior</b>, not a junior. Different skill entirely — it is peer coaching, not teaching.</li>
<li><b>How do you handle disagreeing with a director or a founder?</b> Privately first, with data, and with a clear statement of what you will do if the decision goes the other way.</li>
<li><b>Describe an incident that crossed team boundaries.</b> Who coordinated? How was the post-mortem run and what actually changed?</li>
<li><b>How do you balance technical debt against features?</b> The error-budget framing from the observability card is the strongest answer — it turns the argument into arithmetic.</li>
<li><b>What is your approach to on-call and to alert quality?</b></li>
<li><b>How do you evaluate a new technology before adopting it?</b> A time-boxed spike with predefined success criteria written down <em>before</em> starting, so the decision is not made by whoever is most excited.</li>
<li><b>How do you hire?</b> What do you look for, what do you screen out, how do you run your part of a loop.</li>
<li><b>What is the largest scope you have owned, honestly?</b> Answer truthfully. Overclaiming scope is trivially exposed by two follow-up questions, and it ends the round.</li>
</ul>`,
note:`<p><b>Where you are genuinely light:</b> most of your evidence is one-team scope. Do not manufacture stories you do not have — say plainly that your scope has been depth on four systems rather than breadth across teams, name the standards work as your clearest cross-cutting example, and say what scope you are looking to grow into. Interviewers respect an accurate self-assessment far more than an inflated one, and they will find out either way.</p>`
}
]},
{
id:'plan', code:'✓', navTitle:'The week before',
title:'The week before, and the day itself',
meta:[['Use','Seven days out'],['If you have one night','Do day 1 and go']],
tiers:[['service',0],['product',0],['saas',0],['agency',0]],
intro:'If you have a week before the interviews you actually care about, spend it like this. If you are walking in tomorrow, do day one tonight and go — your own story is worth more than any amount of revision.',
qs:[
{
q:'The seven-day plan',
test:'Sequence. Most people revise what they already know and skip what they will be asked.',
a:`<div class="table-scroll"><table>
<thead><tr><th>Day</th><th>Focus</th><th>The actual work</th></tr></thead>
<tbody>
<tr><td class="n">1</td><td>Your own story</td><td>Write real answers to all ten metric questions in R10. Practise the two-minute GetDandy walkthrough out loud five times. Draw its architecture on paper three times from memory. Fix the two resume lines in the scouting report.</td></tr>
<tr><td class="n">2</td><td>JavaScript &amp; TypeScript</td><td>R3 and R3·TS end to end, out loud. Write debounce, throttle, <code>Promise.all</code> and the promise pool from scratch without looking. Make the event-loop ordering automatic.</td></tr>
<tr><td class="n">3</td><td>React &amp; Next.js</td><td>R4. Prepare the Redux→Zustand defence properly — it is the most likely deep question in your loop. Re-read the Next 15/16 caching change until you can explain why the default flipped.</td></tr>
<tr><td class="n">4</td><td>Backend &amp; data</td><td>R5 and R6. Rehearse the no-message-broker answer until it sounds like judgement rather than apology. Write the five SQL queries by hand.</td></tr>
<tr><td class="n">5</td><td>Machine coding</td><td>Build the task board and the data table under a real 90-minute timer, twice. <b>The highest-return day on this list.</b></td></tr>
<tr><td class="n">6</td><td>System design</td><td>Design the booking marketplace and the real-time dashboard out loud with a timer, using the seven-step frame. Record yourself once and listen back — it is unpleasant and it works.</td></tr>
<tr><td class="n">7</td><td>DSA &amp; behavioural</td><td>Eight problems each from hash map, two pointers and sliding window. Then write the six stories in R11 as bullet points, not scripts.</td></tr>
</tbody></table></div>`
},
{
q:'Walk-in day',
test:'Logistics decide more outcomes than people admit.',
a:`<div class="cards">
<div class="card"><h4>Sequence the campaign</h4><p>Interview at the companies you want least in the first two days. You will be sharper by day four, and you want your best performance where it pays most. Compress everything into one week so offers overlap.</p></div>
<div class="card"><h4>Carry paper</h4><p>Six printed resumes, a pen, a small notebook. Write down the interviewer's name and one thing they said in each round — it makes your follow-up email specific instead of generic.</p></div>
<div class="card"><h4>Arrive early, and eat</h4><p>Walk-ins run long and unpredictably. A four-hour queue on an empty stomach is how good candidates fail the last round. Water and something to eat.</p></div>
<div class="card"><h4>Ten minutes of homework per company</h4><p>In the queue, look up what they build and who their customers are. It costs nothing and turns "why do you want to work here" from a stumble into a strength.</p></div>
<div class="card"><h4>Send the note the same evening</h4><p>Short email to the recruiter: thanks, one specific thing from the conversation, one line restating availability. Very few candidates do this and it keeps you visible while they sort fifty resumes.</p></div>
<div class="card"><h4>Debrief every loop</h4><p>Write down every question you were asked and every one you fumbled, the same day. By interview four you will have a personalised version of this page that is better than this one.</p></div>
</div>`
}
]},
];
