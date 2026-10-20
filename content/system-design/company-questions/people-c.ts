import type { ReportSource } from "./types";
import type { PeopleSet } from "./people-types";

const zerodhaPhilosophy: ReportSource = {
  label: "Zerodha: Product and business philosophies",
  url: "https://zerodha.com/about/philosophy/",
  kind: "official",
};
const zerodhaHiring: ReportSource = {
  label: "Z-Connect: On Growth, Hiring, and Thinking Long Term",
  url: "https://zerodha.com/z-connect/rainmatter/rainmatter-fintech-catch-up",
  kind: "official",
  year: 2025,
};
const zerodhaSpaceComplexity: ReportSource = {
  label: "SpaceComplexity: Zerodha onsite interview",
  url: "https://spacecomplexity.ai/blog/zerodha-onsite-interview",
  kind: "prep-guide",
};
const zerodhaDesignGurus: ReportSource = {
  label: "DesignGurus: Zerodha interview process, round by round",
  url: "https://www.designgurus.io/answers/detail/what-is-the-zerodha-interview-process-like-round-by-round",
  kind: "prep-guide",
};
const zerodhaHyring: ReportSource = {
  label: "Hyring: Zerodha interview process",
  url: "https://hyring.com/jobseeker-toolkit/interview-questions/company/zerodha",
  kind: "prep-guide",
};

const growwCareers: ReportSource = { label: "Groww Careers", url: "https://groww.in/careers", kind: "official" };
const growwCodeKerdos: ReportSource = {
  label: "CodeKerdos: Groww SDE-1 interview breakdown",
  url: "https://blog.codekerdos.in/groww-sde-1-interview-a-complete-breakdown/",
  kind: "prep-guide",
};
const growwDesignGurus: ReportSource = {
  label: "DesignGurus: Groww interview process, round by round",
  url: "https://www.designgurus.io/answers/detail/what-is-the-groww-interview-process-like-round-by-round",
  kind: "prep-guide",
};

const paytmTechPrep: ReportSource = {
  label: "TechPrep: Paytm interview process",
  url: "https://www.techprep.app/blog/paytm-interview-process",
  kind: "prep-guide",
};
const paytmCampus: ReportSource = {
  label: "GeeksforGeeks: Paytm campus experience (technical plus HR)",
  url: "https://www.geeksforgeeks.org/?p=679857",
  kind: "candidate-report",
};

const olaCareers: ReportSource = {
  label: "Ola Cabs Careers: Life at Ola",
  url: "https://www.olacabs.com/careers",
  kind: "official",
};
const olaSet4: ReportSource = {
  label: "GeeksforGeeks: Ola Cabs SDE-2 (Set 4)",
  url: "https://geeksforgeeks.org/ola-cabs-interview-experience-set-4-for-sde-2",
  kind: "candidate-report",
};
const olaSde2: ReportSource = {
  label: "GeeksforGeeks: Ola SDE-2 experience",
  url: "https://www.geeksforgeeks.org/ola-interview-experience-for-sde-2/",
  kind: "candidate-report",
};
const olaOneYear: ReportSource = {
  label: "GeeksforGeeks: Ola (1 yr experience)",
  url: "https://www.geeksforgeeks.org/ola-interview-experience-1-year-experienced/",
  kind: "candidate-report",
};
const olaIntern: ReportSource = {
  label: "GeeksforGeeks: Ola internship experience (HR round)",
  url: "https://www.geeksforgeeks.org/?p=751319",
  kind: "candidate-report",
};

const dreamCareers: ReportSource = {
  label: "Dream Sports Group Careers",
  url: "https://dreamsports.group/careers",
  kind: "official",
};
const dreamSde2: ReportSource = {
  label: "GeeksforGeeks: Dream11 SDE-2 experience (rounds Mar-Apr 2024)",
  url: "https://www.geeksforgeeks.org/interview-experiences/dream11-interview-experience-for-sde-2/",
  kind: "candidate-report",
  year: 2024,
};

const juspayAbout: ReportSource = { label: "Juspay: About us", url: "https://juspay.io/about", kind: "official" };
const juspaySde1: ReportSource = {
  label: "GeeksforGeeks: Juspay SDE-1 (1 yr experience, via HackerEarth)",
  url: "https://www.geeksforgeeks.org/?p=447763",
  kind: "candidate-report",
};
const juspayIntern: ReportSource = {
  label: "GeeksforGeeks: Juspay 6-month SDE intern experience",
  url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-experience-for-sde-6m-intern/",
  kind: "candidate-report",
};

const myntraSenior: ReportSource = {
  label: "GeeksforGeeks: Myntra senior software engineer (5 yrs)",
  url: "https://www.geeksforgeeks.org/?p=370480",
  kind: "candidate-report",
};
const myntraDesignGurus: ReportSource = {
  label: "DesignGurus: Myntra interview process, round by round",
  url: "https://www.designgurus.io/answers/detail/what-is-the-myntra-interview-process-like-round-by-round",
  kind: "prep-guide",
};

export const people: PeopleSet[] = [
  {
    company: "zerodha",
    valuesSource: zerodhaPhilosophy,
    values: [
      {
        name: "Customer interest over growth",
        line: "Do not nudge or induce people into actions that do not serve them, even when that action would lift a number.",
      },
      {
        name: "Transparency",
        line: "Described as central to the business, with examples such as an early brokerage calculator and public disclosure of regulatory filings about technical glitches.",
      },
      {
        name: "No metric-based growth targets",
        line: "No targets on accounts opened, app installs, orders or revenue, so employees are not pushed by perverse incentives.",
      },
    ],
    themes: [
      "Reason for applying and motivation",
      "Notice period and logistics",
      "Simplicity, transparency and ownership",
      "Things you built outside work",
      "Working style and expectation alignment",
      "Regulation-shaped routine work",
    ],
    questions: [
      {
        id: "zerodha-simplify",
        q: "Describe a time you took something complicated and made it simpler for the people who had to use or maintain it.",
        why: "A prep guide describes a conversational culture round that probes for times you simplified something complex, and the same guide ties Zerodha to simplicity and common sense over coolness.",
        frame:
          "Name the original complexity, what you removed or merged, and how you knew it was safe to cut. Close with what got easier for the next person. An opening you can adapt: 'The part of [system] that people avoided touching was [thing], so I [removed or merged what], and the result was [measurable or visible change].'",
        grade: "guide",
        sources: [zerodhaSpaceComplexity],
      },
      {
        id: "zerodha-pushback",
        q: "Tell me about a time you pushed back on a feature or change because it would have hurt the people using the product.",
        why: "A prep guide reports this theme, and it lines up with the published principle of not steering customers toward actions that are not in their interest.",
        frame:
          "Show the harm you saw, the evidence you brought, who you raised it with and what was decided, including if you lost the argument. Keep it about the user rather than about winning. An opening you can adapt: 'We were about to ship [change], and I could see it would [specific harm to users], so I [took this step] before the date.'",
        book: { round: "r11", qid: "r11-1" },
        grade: "guide",
        sources: [zerodhaSpaceComplexity, zerodhaPhilosophy],
      },
      {
        id: "zerodha-solo",
        q: "Give an example of something you figured out entirely on your own, with no one to show you the way.",
        why: "The same guide lists figuring things out alone as part of the culture conversation, and a Z-Connect post says there are no titles or conventional ladder, so people who can unblock themselves fit that setup.",
        frame:
          "Say what was unfamiliar, how you broke it down, what you read or tried, and where you decided to stop and ask. Show the habit, not just the result. An opening you can adapt: 'I had no one nearby who knew [area], so I started by [first concrete step] and set myself a limit of [time] before asking.'",
        grade: "guide",
        sources: [zerodhaSpaceComplexity],
      },
      {
        id: "zerodha-why-apply",
        q: "Why do you want to work here, and what drew you to this company in particular?",
        why: "A guide reports that the recruiter call covers background and the reason for applying, and a Z-Connect post says hiring looks for people who share the philosophies and are committed for the long term.",
        frame:
          "Anchor on one or two things from the published philosophy that you can connect to work you have done, rather than on brand or growth. Be honest about what you would give up or change. An opening you can adapt: 'What stood out to me is [specific principle], because in my last role I saw [concrete situation] go the other way.'",
        book: { round: "r11", qid: "r11-3" },
        grade: "guide",
        sources: [zerodhaDesignGurus, zerodhaHiring],
      },
      {
        id: "zerodha-no-targets",
        q: "There are no metric-based growth targets here. What keeps you doing good work when nobody measures a number against you?",
        why: "The philosophy page describes no metric-driven incentives, so a listener may want to hear what drives you when external targets are absent.",
        frame:
          "Give your own internal standard, such as correctness, reviews you hold yourself to or user outcomes you track informally, then one habit that proves it. Avoid claiming you dislike all measurement. An opening you can adapt: 'My own bar is [standard], and I check it by [habit], even when nobody else looks at it.'",
        grade: "guide",
        sources: [zerodhaPhilosophy],
      },
      {
        id: "zerodha-no-titles",
        q: "This company has no conventional titles or ladder. How do you think about growth and responsibility without them?",
        why: "A Z-Connect post sharing the CTO's views says there are no titles or conventional ladder and that growth means being given more responsibility and allowed more risk, so a candidate who needs a title ladder may be a poor fit.",
        frame:
          "Describe a time you widened your scope without a title change, what you took ownership of and what risk came with it. Say what recognition you do want. An opening you can adapt: 'In [role] I took on [extra responsibility] before anyone assigned it, and what I learned about carrying that risk was [lesson].'",
        grade: "guide",
        sources: [zerodhaHiring],
      },
      {
        id: "zerodha-hr-screen",
        q: "What are you looking for in terms of role, location, working mode and notice period?",
        why: "One guide describes the HR screen as covering fit, location, work mode, salary and notice period, and another mentions background, reason for applying and notice period, so logistics and expectations are checked early.",
        frame:
          "Have your notice period, any buy-out option and your location and mode preferences ready in two sentences, and state them without hedging. Do not volunteer a figure before you understand the role. An opening you can adapt: 'My notice period is [period], and I can [shorten it or not]; for work mode I am looking for [mode].'",
        book: { round: "r1", qid: "r1-4" },
        grade: "guide",
        sources: [zerodhaHyring, zerodhaDesignGurus],
      },
    ],
    offer: [
      "No first-hand offer account was found. The only official description of hiring is a December 2025 Z-Connect post sharing the CTO's views, which describes hiring for long-term commitment and shared philosophies, no titles, and pay growth tied to personal and professional growth rather than hierarchy.",
      "One guide says the HR screen touches on salary and notice period, but neither guide is a first-hand report, so treat the timing as unconfirmed.",
      "As general advice, ask for the complete breakdown in writing, confirm how the notice period or any buy-out is handled, and ask how responsibility and pay change over time given there is no ladder.",
    ],
    gaps: "No first-hand Zerodha engineering report was readable, so all behavioural content here is guide-level. One guide says the CTO or senior leadership often runs the culture round, which no other source confirms, and that guide also promotes a mock-interview service. The philosophy page is the only values source; the hiring and no-titles points come from a Z-Connect post by an investments team member, which also says Zerodha was not hiring at the time.",
  },
  {
    company: "groww",
    valuesSource: growwCareers,
    values: [
      {
        name: "Impact you can see",
        line: "Your work reaches a very large number of users across India, so be ready to talk about outcomes.",
      },
      {
        name: "Room to experiment",
        line: "A safe place to try things, fail and iterate, as long as the bets are taken with care.",
      },
      {
        name: "No straitjackets here",
        line: "A role is only a starting point, and stepping outside your own lane to help is welcomed.",
      },
      {
        name: "High stakes, low stress",
        line: "Hard engineering and product problems handled in a relaxed, open working environment.",
      },
      {
        name: "Work friends are real friends",
        line: "Collaboration works best when colleagues genuinely like working with each other.",
      },
      {
        name: "Transparency by default",
        line: "Context is shared openly across teams so that decisions are made with full information.",
      },
    ],
    themes: [
      "Project depth and ownership",
      "Reason for the move",
      "Customer-first thinking and risk in money features",
      "End-to-end ownership and production issues",
      "Simple design and technical debt",
      "Metrics and impact",
      "Compensation expectations and notice period",
    ],
    questions: [
      {
        id: "groww-user-over-convenience",
        q: "Tell me about a time you put user experience or safety ahead of what was easiest for your team.",
        why: "A prep guide reports this theme, and for a product that handles people's savings the listener is checking where your instincts sit when convenience and users conflict.",
        frame:
          "Describe the trade, what it cost the team in time or effort, and how you made the case. Close with the user outcome, ideally something you could see. An opening you can adapt: 'The quick option for us was [shortcut], but it meant users would [downside], so I proposed [alternative] and accepted [cost].'",
        grade: "guide",
        sources: [growwCodeKerdos],
      },
      {
        id: "groww-money-risk",
        q: "How do you think about risk when building or changing a feature that touches users' money?",
        why: "The same guide reports a risk question about money features; it checks whether you reach for validation, rollout control and recovery rather than only speed.",
        frame:
          "Walk through the failure you would fear most, how you would detect it, how you would limit the blast radius, and how you would roll back or reconcile. Use a real feature if you have one. An opening you can adapt: 'The first thing I ask is what the worst wrong outcome is for the user, and then I [guard or rollout step].'",
        grade: "guide",
        sources: [growwCodeKerdos],
      },
      {
        id: "groww-end-to-end",
        q: "Walk me through a production issue in something you owned end to end: how you debugged it and what changed afterwards.",
        why: "A guide reports end-to-end ownership and production incidents as a theme; the listener wants the full loop, including the long-term fix and not only the patch.",
        frame:
          "Cover detection, the working theory, how you confirmed it, the immediate fix, and one lasting change such as an alert, test or design change. Own your part honestly. An opening you can adapt: 'We first noticed it when [signal], and my first hypothesis was [guess], which turned out to be [right or wrong].'",
        book: { round: "r10", qid: "r10-5" },
        grade: "guide",
        sources: [growwCodeKerdos],
      },
      {
        id: "groww-simple-design",
        q: "Describe a time you chose a simple design over a more impressive one, and why.",
        why: "A guide reports a simple-over-fancy theme; it tests judgement about maintenance and delivery cost against technical appeal.",
        frame:
          "State the clever option you considered, the plain one you chose, the criteria behind the choice and what happened later. Show that you would revisit the choice if conditions changed. An opening you can adapt: 'We could have built [elaborate option], but the real need was [need], so we used [simple option].'",
        grade: "guide",
        sources: [growwCodeKerdos],
      },
      {
        id: "groww-tech-debt",
        q: "Tell me about technical debt you took on deliberately and how you planned to pay it back.",
        why: "A guide reports this prompt; the listener is checking whether you take shortcuts consciously, name them and follow through.",
        frame:
          "Give the deadline or constraint that justified the shortcut, how you recorded it, when and how it was repaid, and what you would do differently. If it was never repaid, say so plainly. An opening you can adapt: 'We knowingly shipped [shortcut] to hit [constraint], and I wrote it down with [owner or date].'",
        grade: "guide",
        sources: [growwCodeKerdos],
      },
      {
        id: "groww-project-move",
        q: "Tell me about your most significant project, what you owned in it, and why you are looking to move now.",
        why: "A guide reports that the hiring manager round, held with the manager of the team you would join, evaluates project depth and ownership, and that candidates are asked why they are changing jobs.",
        frame:
          "Lead with the project, your specific ownership and a result, then give the reason for moving as something you are heading toward. Keep the tone positive about your current employer. An opening you can adapt: 'The part I owned was [scope], and what I want next is [specific growth], which I cannot get where I am.'",
        book: { round: "r1", qid: "r1-2" },
        grade: "guide",
        sources: [growwDesignGurus],
      },
      {
        id: "groww-outside-lane",
        q: "Give an example of stepping outside your own role to help the team or a user.",
        why: "The careers page presents roles as a starting point and encourages going beyond them, so the listener may probe for evidence that you already work this way.",
        frame:
          "Pick a case where you picked up work no one assigned, say how you checked with the owner first, and what the team gained. Show that you did not leave your own work behind. An opening you can adapt: 'I noticed [gap] sitting between teams, so I [action], after agreeing it with [person].'",
        grade: "guide",
        sources: [growwCareers],
      },
    ],
    offer: [
      "A DesignGurus guide reports that compensation and notice period are discussed with the recruiter and again in the hiring manager round. This is secondary reporting, not a named candidate.",
      "The careers page says candidates hear back in days. The same guide notes that compensation and notice period come up again with the hiring manager, and that one candidate reported a round of about fifteen minutes that was mostly a company overview.",
      "As general advice, give your notice period plainly, ask for the full breakdown of fixed and variable pay, and ask about level and band before you discuss a number.",
    ],
    gaps: "No first-hand behavioural report was readable, because the usual candidate sites were not accessible. Both guides are secondary: one says it distils experiences from several learners, the other collects reported experiences without naming candidates. Round lengths differ between them, so treat timings as rough.",
  },
  {
    company: "paytm",
    values: [
      {
        name: "Shipping under a deadline",
        line: "A prep guide lists shipping a critical feature under a tight timeline as a typical managerial prompt.",
      },
      {
        name: "Calm outage response",
        line: "The same guide lists responding to a production outage in a high-throughput system as a typical prompt.",
      },
      {
        name: "Ownership under pressure",
        line: "The guide says interviewers look for evidence that you take ownership, so expect to show a problem followed through to the end.",
      },
      {
        name: "Working through ambiguity",
        line: "The guide says interviewers look for people who can navigate ambiguity, so have an example of unclear requirements.",
      },
      {
        name: "Clear communication",
        line: "The guide says interviewers look for people who communicate well under pressure.",
      },
      {
        name: "Motivation for Paytm",
        line: "A campus report lists a direct why-Paytm question in the HR round, so a specific reason helps.",
      },
    ],
    themes: [
      "Shipping a critical feature on a tight timeline",
      "Responding to a production outage",
      "Ownership and communication under pressure",
      "Ambiguity",
      "Why Paytm",
      "Strengths and weaknesses",
      "Compensation expectations and logistics",
    ],
    questions: [
      {
        id: "paytm-tight-timeline",
        q: "Tell me about shipping an important feature against a tight deadline. What did you cut, and what did you protect?",
        why: "A prep guide lists this as a typical managerial-round prompt; the listener checks whether you can scope under pressure without hiding the risk you accepted.",
        frame:
          "Set out the fixed date, the scope you reduced and why, what you refused to cut (correctness, rollback, monitoring), and how you told stakeholders. An opening you can adapt: 'We had [number] weeks to deliver [feature], so I split the work into [must-have] and [later], and I would not compromise on [protected item].'",
        grade: "guide",
        sources: [paytmTechPrep],
      },
      {
        id: "paytm-outage",
        q: "Describe how you responded when a high-traffic system you worked on went down.",
        why: "The same guide lists an outage prompt; it checks calm triage, communication during the incident and what you changed afterwards.",
        frame:
          "Follow the order: detect, reduce user impact, find the cause, fix, communicate, then prevent. Say who you kept informed and how often, and what the post-incident change was. An opening you can adapt: 'The first signal was [alert or report], and before looking for the cause I focused on [mitigation step].'",
        book: { round: "r10", qid: "r10-5" },
        grade: "guide",
        sources: [paytmTechPrep],
      },
      {
        id: "paytm-why",
        q: "Why do you want to join this company in particular?",
        why: "A campus candidate reports being asked this directly in the HR round; the listener wants a reason that is specific and not generic enthusiasm.",
        frame:
          "Give one concrete reason tied to scale or the type of problems in payments, one tied to your own skills, and one honest thing you want to learn. Avoid repeating the brand name as the reason. An opening you can adapt: 'The kind of problem I want more of is [problem type], and your scale means I would see it in [way].'",
        book: { round: "r11", qid: "r11-3" },
        grade: "one",
        sources: [paytmCampus],
      },
      {
        id: "paytm-strengths-weaknesses",
        q: "What are your strengths and your weaknesses?",
        why: "The campus HR round included this question; the listener checks self-awareness and whether the weakness you name is real and being worked on.",
        frame:
          "Choose strengths you can prove with one example each, and a real weakness that is not fatal for the role, followed by what you are doing about it. An opening you can adapt: 'One thing I do well is [strength], for example when [short example]; something I am working on is [weakness], and I handle it by [habit].'",
        grade: "one",
        sources: [paytmCampus],
      },
      {
        id: "paytm-projects",
        q: "Walk me through an internship or project you worked on and what you personally did in it.",
        why: "The campus report describes a short internship and project discussion at the end of the second technical round; the listener checks that your claimed work is really yours.",
        frame:
          "Give the goal, your own part in two or three sentences, one hard decision and the outcome. Be ready for follow-ups on any detail you mention. An opening you can adapt: 'The project was [goal]; my part was [specific piece], and the decision I would defend is [decision].'",
        book: { round: "r1", qid: "r1-7" },
        grade: "one",
        sources: [paytmCampus],
      },
      {
        id: "paytm-compensation",
        q: "What are your compensation expectations, and what are the logistics around joining?",
        why: "A guide says the final HR conversation covers compensation expectations, logistics and next steps in the offer process, so the listener is aligning the offer with your situation.",
        frame:
          "Know your current pay structure, your notice period and any buy-out options before the call. Give a researched range and anchor it on the role, not on your current pay alone. An opening you can adapt: 'Based on the scope of the role and the market, I am looking at [range], and I am flexible on how it is split.'",
        book: { round: "r12", qid: "r12-3" },
        grade: "guide",
        sources: [paytmTechPrep],
      },
    ],
    offer: [
      "A prep guide says the final HR conversation covers compensation expectations, logistics and next steps in the offer process. No first-hand offer account from an experienced hire was found.",
      "As general advice, get the full breakdown of fixed pay, variable pay and any joining terms in writing, check the notice period and buy-out position, and ask about the level and band before sharing a figure.",
    ],
    gaps: "No official values page was found; these are the themes a prep guide and a campus report point to, not Paytm statements. The only first-hand source is a campus report, undated apart from a July 2025 page update, and no experienced-hire managerial or HR account was readable.",
  },
  {
    company: "ola",
    valuesSource: olaCareers,
    values: [
      {
        name: "Impact oriented",
        line: "Work quickly and hard so that the effect of what you do is felt soon.",
      },
      {
        name: "Passionate",
        line: "Listed as its own heading, but the page repeats the impact text, so read it as drive and urgency.",
      },
      {
        name: "Ambitious Goals",
        line: "Set audacious goals, on the belief that ambitious goals make for outstanding achievements.",
      },
      {
        name: "Obsessively hyperlocal",
        line: "Understand India's own transport needs closely and build solutions that fit local conditions.",
      },
      {
        name: "Infectious Energy",
        line: "Keep ideas, experiments and discussion constantly in motion across the team.",
      },
      {
        name: "Enterprising",
        line: "Have the courage to be creative and try new opportunities when they appear.",
      },
    ],
    themes: [
      "Strengths, weaknesses, best and worst moments",
      "Why change and why this company",
      "Project questions with scaling and caching follow-ups",
      "Behavioural talk mixed with technical probes",
      "Knowledge of the product and an issue faced as a user",
      "Location comfort and remote-work challenges",
    ],
    questions: [
      {
        id: "ola-strengths-weaknesses",
        q: "What are your strengths and weaknesses?",
        why: "A candidate reports these in a forty-five minute managerial round described as basic questions; the listener looks for honest self-assessment that matches the work you describe elsewhere.",
        frame:
          "Pick strengths with proof, and a weakness that you are actively managing with a concrete habit. Keep the answer under two minutes. An opening you can adapt: 'My strongest area is [strength], which showed when [short example]; I used to struggle with [weakness], and now I [habit].'",
        grade: "one",
        sources: [olaSet4],
      },
      {
        id: "ola-best-worst",
        q: "Tell me about your best and your worst moments in your career so far.",
        why: "The same candidate reports a best and worst moments question; it shows what you value and how you handle setbacks.",
        frame:
          "Choose a best moment tied to impact you caused, and a worst moment where you can show accountability and what changed in your behaviour. Do not blame others. An opening you can adapt: 'My best moment was when [outcome you drove], and the lowest point was [setback], which taught me [specific change].'",
        grade: "one",
        sources: [olaSet4],
      },
      {
        id: "ola-why-change",
        q: "Why do you want to change jobs now?",
        why: "It is reported in a managerial round, and the listener wants to see whether you are moving toward something or only away from something.",
        frame:
          "Give one forward-looking reason, one fact about your current situation that supports it, and avoid criticising your employer. An opening you can adapt: 'I have learned [skills] in my role, and the next thing I want is [scope or problem type], which the work here offers.'",
        book: { round: "r1", qid: "r1-2" },
        grade: "one",
        sources: [olaSet4],
      },
      {
        id: "ola-why-ola",
        q: "Why do you want to work at this company, and what do you know about it?",
        why: "An internship HR round and an SDE-2 managerial round are reported to include what you know about the company or why Ola, and the careers page stresses local, fast-moving work, so specific knowledge will help.",
        frame:
          "Refer to a product or problem area you have actually looked at, connect it to the local-market focus on the careers page, and link it to your skills. An opening you can adapt: 'What interests me is [specific problem], because it needs [skill I have], and I have seen it myself when [short real context].'",
        book: { round: "r11", qid: "r11-3" },
        grade: "several",
        sources: [olaIntern, olaSet4, olaCareers],
      },
      {
        id: "ola-behavioural-technical",
        q: "Tell me about a technical decision you made, and how that system behaves when parts of it fail.",
        why: "An SDE-2 candidate describes a hiring manager round of general and behavioural talk mixed with technical topics such as circuit breakers, schedulers, load balancing and caching, so stories may be tested on technical depth.",
        frame:
          "Pick a story where you can explain the technical mechanism, the alternatives you rejected and how the system behaved under failure. Be ready to move from story to design details. An opening you can adapt: 'I chose [approach] over [alternative] because [constraint], and the failure case I planned for was [case].'",
        grade: "one",
        sources: [olaSde2],
      },
      {
        id: "ola-projects-scaling",
        q: "Walk me through a project you built, and how it would change if traffic grew many times over.",
        why: "One candidate reports project questions and vertical versus horizontal scaling in the hiring manager round, and another reports scaling and caching probes in theirs, so the listener checks you understand your own system's limits.",
        frame:
          "Describe the architecture briefly, the likely first bottleneck, whether you would scale vertically or horizontally, and what you would cache or partition. Admit what you have not measured. An opening you can adapt: 'The first thing to break would be [component], so I would [scaling step], and I would verify it by [measure].'",
        book: { round: "r10", qid: "r10-2" },
        grade: "several",
        sources: [olaOneYear, olaSde2],
      },
      {
        id: "ola-user-issue",
        q: "Think of a problem you faced as a user of this company's product. How would you fix it as a developer?",
        why: "An internship candidate reports being asked about an issue faced as a user, which tests product sense and the ability to turn a complaint into an engineering plan.",
        frame:
          "Describe the problem from the user's side, name the likely cause on the system side, and propose a fix plus how you would measure improvement. Keep it concrete. An opening you can adapt: 'As a rider, the issue I noticed was [issue]; I think it comes from [cause], and I would fix it by [change].'",
        grade: "one",
        sources: [olaIntern],
      },
      {
        id: "ola-location",
        q: "How comfortable are you with the office location and working on site with the team?",
        why: "The internship report includes whether the office location suits you and the challenges of a remote internship, so the listener is checking logistical fit and how you cope without close collaboration.",
        frame:
          "Answer plainly about commute or relocation, mention how you have collaborated closely with teams before, and be honest about any constraint rather than hiding it. An opening you can adapt: 'I am comfortable working from the office, and I have already planned [commute or relocation detail].'",
        book: { round: "r11", qid: "r11-5" },
        grade: "one",
        sources: [olaIntern],
      },
    ],
    offer: [
      "None of the reports found describe a compensation or notice-period conversation, so there is nothing reported to summarise here.",
      "As general advice, ask for the full breakdown of fixed and variable pay, confirm the level and band, clarify the notice period and any buy-out, and avoid naming a figure before you know the scope.",
    ],
    gaps: "The four candidate reports give no interview dates; two pages were last updated in 2021 and two in 2025, which is an edit date, not an interview date. No compensation account was found. The careers page speaks for the wider mobility group, including Electric, so treat its values as indicative for any one team.",
  },
  {
    company: "dream11",
    valuesSource: dreamCareers,
    values: [
      {
        name: "Data Driven",
        line: "Presented in a testimonial as an expectation for everyone, so be ready to show how data shaped your own decisions.",
      },
      {
        name: "Ownership",
        line: "Described in the testimonial as owning problems end to end.",
      },
      {
        name: "Perseverance",
        line: "Named in the testimonial without a description, so bring your own example of persisting through a setback.",
      },
      {
        name: "User First",
        line: "Described in the testimonial as viewing everything with a user-first lens.",
      },
      {
        name: "Transparency",
        line: "Named in the testimonial without a description, so bring your own example of working openly.",
      },
    ],
    themes: [
      "How you would hire as the interviewer",
      "Reflection on your earlier rounds",
      "Payment-system implementation and monitoring",
      "Defining availability and service health metrics",
      "A failure or a disappointing manager decision",
      "What a manager would say for and against hiring you",
    ],
    questions: [
      {
        id: "dream11-hire-yourself",
        q: "If you were interviewing for this role, how would you hire, and what qualities would you look for?",
        why: "One candidate reports this in a hiring manager round; it shows what you consider good engineering and whether you can see your own interview from the other side.",
        frame:
          "Name three or four qualities, say how you would test each fairly, and note what you would not overweight. Tie at least one quality to the ownership or data-driven values. An opening you can adapt: 'I would look first for [quality], and I would test it by [method], because [reason].'",
        grade: "one",
        sources: [dreamSde2],
      },
      {
        id: "dream11-round-feedback",
        q: "What is your own feedback on how your earlier interview rounds went?",
        why: "The same candidate reports being asked to reflect on earlier rounds, which checks self-awareness and honesty about what you did not know.",
        frame:
          "Name one thing that went well, one thing you struggled with and what you would do differently. Do not criticise the interviewers. An opening you can adapt: 'I was comfortable with [area], but on [topic] I was slower than I wanted, and I have started [fix].'",
        grade: "one",
        sources: [dreamSde2],
      },
      {
        id: "dream11-payments",
        q: "How did you implement a key function in a payment system you worked on, and what did you watch to know it was healthy?",
        why: "A candidate reports questions on payment-system implementation and monitoring, which checks that your claimed work is real and that you think about correctness with money.",
        frame:
          "Describe the flow, what makes duplicates or partial failures safe, and the signals you track. Be specific about numbers you actually know. An opening you can adapt: 'The function I owned was [function]; to keep it safe on retries I [mechanism], and I watched [signals].'",
        grade: "one",
        sources: [dreamSde2],
      },
      {
        id: "dream11-availability",
        q: "How do you define availability for a service, and which metrics tell you it is healthy?",
        why: "This is reported in the same round and ties to the data-driven value; it checks whether you can turn vague reliability into measurable terms.",
        frame:
          "Define availability from the user's side, such as successful requests over total, then name latency, error rate and saturation signals, and a threshold you would alert on. An opening you can adapt: 'I measure it as [definition], and I alert when [signal] crosses [threshold] for [duration].'",
        grade: "one",
        sources: [dreamSde2],
      },
      {
        id: "dream11-failed-project",
        q: "Tell me about a project that failed or fell short, and what you took from it.",
        why: "A failed-project question is reported in a hiring manager round; the listener checks accountability and perseverance more than the failure itself.",
        frame:
          "State the goal, what went wrong, your share of the cause, what you did next and what you do differently now. Avoid a failure that is secretly a success. An opening you can adapt: 'The project missed [goal] because I [your part], and what I changed afterwards was [practice].'",
        book: { round: "r10", qid: "r10-3" },
        grade: "one",
        sources: [dreamSde2],
      },
      {
        id: "dream11-manager-decision",
        q: "Tell me about a manager's decision you were disappointed by and how you handled it.",
        why: "The same candidate reports this prompt; it tests how you disagree, whether you commit afterwards and how you speak about former managers.",
        frame:
          "Describe the decision neutrally, how you raised your view, what was decided and how you acted after it. Show that you can disagree and still deliver. An opening you can adapt: 'I disagreed with the decision to [decision] because [reason], so I [how you raised it], and once it was settled I [how you committed].'",
        book: { round: "r11", qid: "r11-1" },
        grade: "one",
        sources: [dreamSde2],
      },
      {
        id: "dream11-manager-would-say",
        q: "What would your manager say are the reasons to hire you, and the reasons not to?",
        why: "A candidate reports this two-sided question, which checks if your self-view matches what colleagues actually see and whether you can name a real gap.",
        frame:
          "Give two reasons your manager would back with examples, and one honest reason against with what you are doing about it. An opening you can adapt: 'My manager would say I am strong at [skill], for example [example], and they would also say I can be slow to [weakness].'",
        grade: "one",
        sources: [dreamSde2],
      },
    ],
    offer: [
      "The only candidate account found describes a rejection: HR said positives were noted but technical gaps remained. No compensation or notice-period conversation is reported.",
      "As general advice, ask for the full breakdown of fixed and variable pay and how bonuses are paid, check the notice period and buy-out, and ask about the level and band before sharing a figure.",
    ],
    gaps: "Only one candidate account was found, with coding, project and design rounds dated March and April 2024 and an undated hiring manager round. The five values appear only inside one testimonial by a FanCode executive on the careers page, two of them with no description, not as a standalone list. No compensation account was found.",
  },
  {
    company: "juspay",
    valuesSource: juspayAbout,
    values: [
      {
        name: "Maximize Value Creation",
        line: "Create value from very little and do more with less.",
      },
      {
        name: "Take big, courageous moves",
        line: "Reduce risk, build a cushion, then go for outcomes that are many times larger.",
      },
      {
        name: "Unify: bring order to chaos",
        line: "Bring order to messy problems by going back to fundamentals and first principles.",
      },
      {
        name: "Open up: bring creativity to break rigidity",
        line: "Diversify and experiment, and challenge assumptions and rules that no longer hold.",
      },
      {
        name: "Enable people to create 10X magic",
        line: "Empower people to find their potential and commit to doing the right thing.",
      },
      {
        name: "Focus on software and design platforms",
        line: "Build on software and design platforms and blocks, since digital product design is still early.",
      },
      {
        name: "Tenets for 10X: Reliability",
        line: "Root-cause reviews done with rigour, and shared ownership of production reliability with collaborative incident response.",
      },
    ],
    themes: [
      "Life story, likes and dislikes",
      "In-depth systems questions",
      "Project discussion and where you will be in five years",
      "A problem solved overnight and discussed asynchronously",
      "Core computer science depth",
      "Whether you use AI in day-to-day work",
    ],
    questions: [
      {
        id: "juspay-background",
        q: "Tell me about your background, and what you like and dislike about the work you do.",
        why: "A candidate reports a founder conversation that started with background, likes and dislikes, so the listener is checking motivation and taste before moving to depth.",
        frame:
          "Tell the story in under two minutes with a clear thread, and be specific about what energises you and what drains you. Honest dislikes should not disqualify you for this role. An opening you can adapt: 'I came to this work through [path], and what keeps me interested is [specific kind of problem].'",
        book: { round: "r1", qid: "r1-1" },
        grade: "one",
        sources: [juspaySde1],
      },
      {
        id: "juspay-overnight",
        q: "If you were given a hard problem to solve overnight and then had to discuss your solution in writing, how would you approach it?",
        why: "A candidate describes an overnight problem whose solution was discussed over chat, which tests independent problem solving and clear written explanation.",
        frame:
          "Describe how you would clarify the requirement, work in small checkable steps, write down assumptions and present the solution so someone else can challenge it. An opening you can adapt: 'I would start by restating the problem in writing, then solve a simple case, then generalise, and I would send my assumptions with the answer.'",
        grade: "one",
        sources: [juspaySde1],
      },
      {
        id: "juspay-five-years",
        q: "Where do you see yourself in five years?",
        why: "It is reported in the founder conversation, so the listener is checking whether your direction is consistent with building depth in a product company.",
        frame:
          "Describe the kind of problems and the depth you want to have, not a title. Connect it to something you are already doing, and keep it flexible. An opening you can adapt: 'In five years I want to be someone who understands [domain] deeply enough to [capability], and I am working on that by [habit].'",
        book: { round: "r11", qid: "r11-4" },
        grade: "one",
        sources: [juspaySde1],
      },
      {
        id: "juspay-projects",
        q: "Walk me through one of your projects, including the decisions you would revisit.",
        why: "Project discussion is reported in the founder conversation, and the reliability and first-principles values suggest depth and honesty about trade-offs will matter.",
        frame:
          "Explain the problem, your design, the reasoning from first principles and one decision you would change with hindsight. Expect follow-ups on any detail. An opening you can adapt: 'The core problem was [problem]; I chose [approach] because [reason], and with what I know now I would change [part].'",
        book: { round: "r10", qid: "r10-2" },
        grade: "one",
        sources: [juspaySde1],
      },
      {
        id: "juspay-ai-daily",
        q: "Do you use AI tools in your daily work, and how do you decide when to trust their output?",
        why: "An intern reports being asked whether they use AI daily; the listener is checking honest tool use and whether you verify results rather than paste them.",
        frame:
          "Say what you use it for, what you never delegate, and how you verify output through tests, reading and small experiments. Be honest rather than performing enthusiasm or avoidance. An opening you can adapt: 'I use it for [tasks], but I check the result by [method], and I do not use it for [task] because [reason].'",
        grade: "one",
        sources: [juspayIntern],
      },
      {
        id: "juspay-do-more-with-less",
        q: "Tell me about a time you delivered strong results with very limited time or resources.",
        why: "The company's own page frames value creation as doing more with less, so the listener may want evidence that you work well under constraints.",
        frame:
          "Describe the constraint, what you chose not to build, how you reused existing pieces and the outcome. Show judgement, not just effort. An opening you can adapt: 'We had only [constraint], so I reused [existing thing] and skipped [feature], which still delivered [result].'",
        grade: "guide",
        sources: [juspayAbout],
      },
      {
        id: "juspay-incident-ownership",
        q: "Tell me about a production incident you were part of: how the team responded and what you learned from the root-cause review.",
        why: "The page describes rigorous root-cause review and shared ownership of production, so this checks whether you treat incidents as team learning rather than blame.",
        frame:
          "Cover the timeline, your role, how responsibility was shared, the root cause (not only the trigger) and the change that came from the review. An opening you can adapt: 'The trigger was [event], but the root cause was [deeper cause], and the review led us to [change].'",
        book: { round: "r10", qid: "r10-5" },
        grade: "guide",
        sources: [juspayAbout],
      },
    ],
    offer: [
      "The SDE-1 candidate describes the final HR round as a formality after which they were told an offer would be rolled out. This is one undated account and should not be read as the usual pattern.",
      "No compensation or notice-period conversation is reported. As general advice, ask for the full pay breakdown in writing, confirm the notice period and buy-out, and ask about level and band before you name a figure.",
    ],
    gaps: "All first-hand reports are undated pages from an SDE-1 and an intern, with no experienced-hire manager, compensation or notice-period account. The value names follow the company's own Juspay Formula and reliability tenets, shortened where the headings are long, and the page also lists a seventh formula point that is not covered here.",
  },
  {
    company: "myntra",
    values: [
      {
        name: "Technical depth",
        line: "A senior report and a guide both list your most challenging technical work as a topic.",
      },
      {
        name: "Reasons for leaving",
        line: "A senior report says why you left your first and current company is asked about, and a guide lists reasons for changing jobs.",
      },
      {
        name: "Team judgement",
        line: "A senior report lists what a good and a bad team mean to you as a topic.",
      },
      {
        name: "Self-awareness",
        line: "A guide lists strengths and weaknesses in the HR round, so have a clear and honest self-view.",
      },
      {
        name: "Current-role detail",
        line: "A guide says the hiring manager round digs into your current responsibilities, stack and API design choices.",
      },
      {
        name: "Initiative beyond work",
        line: "A guide lists personal projects as an HR round topic.",
      },
    ],
    themes: [
      "Most challenging technical work",
      "Reasons for leaving",
      "What makes a good or bad team",
      "Strengths and weaknesses",
      "Current responsibilities and API design choices",
      "Personal projects",
    ],
    questions: [
      {
        id: "myntra-challenging-work",
        q: "What is the most challenging technical problem you have solved, and what made it hard?",
        why: "A senior engineer and a guide both report a hardest-problem question, so the listener is probing depth, ownership and how you reason about difficulty.",
        frame:
          "State the problem and why it was hard, the options you weighed, your own role, the result and what you would improve. Prefer a problem with a measurable result. An opening you can adapt: 'The hardest part was [difficulty], because [reason], and I handled it by [approach].'",
        grade: "several",
        sources: [myntraSenior, myntraDesignGurus],
      },
      {
        id: "myntra-leaving",
        q: "Why did you leave your first company, and why are you looking to leave your current one?",
        why: "A senior candidate and a guide report reasons for leaving as a topic, so the listener looks for a consistent, forward-looking pattern.",
        frame:
          "Give each move a short and honest reason that points toward growth, then connect them into a single direction. Avoid criticism of former employers. An opening you can adapt: 'I left my first role to get [experience], and now I want [next step], which I cannot get in my current position.'",
        book: { round: "r1", qid: "r1-2" },
        grade: "several",
        sources: [myntraSenior, myntraDesignGurus],
      },
      {
        id: "myntra-good-bad-team",
        q: "What does a good team look like to you, and what does a bad one look like?",
        why: "A senior candidate reports this question; it shows what you will contribute to a team and which environments you struggle in.",
        frame:
          "Describe good and bad in terms of behaviours such as feedback, ownership and handling of disagreement, then give an example of how you helped build the first. An opening you can adapt: 'To me a good team [behaviour], and the sign of a weak one is [behaviour], so I try to [action].'",
        grade: "one",
        sources: [myntraSenior],
      },
      {
        id: "myntra-strengths-weaknesses",
        q: "What are your strengths and weaknesses?",
        why: "A guide reports this in the HR round; the listener is checking that your self-view is honest and that you act on your weaknesses.",
        frame:
          "Offer two strengths with proof, and a weakness that is real but manageable, with the habit you use to contain it. An opening you can adapt: 'I am strongest at [strength], for example [example], and I work on [weakness] by [habit].'",
        grade: "guide",
        sources: [myntraDesignGurus],
      },
      {
        id: "myntra-current-role",
        q: "Walk me through your current responsibilities, your stack, and the API design choices you made.",
        why: "A guide reports that the hiring manager digs into current responsibilities and API design, so the listener is checking real ownership and reasoning.",
        frame:
          "Describe your scope, the main services you own, one API decision with its alternatives and what you learned from it. Be ready for follow-ups on versioning and error handling. An opening you can adapt: 'I own [scope], and for [API] I chose [design] over [alternative] because [use case].'",
        book: { round: "r10", qid: "r10-2" },
        grade: "guide",
        sources: [myntraDesignGurus],
      },
      {
        id: "myntra-personal-projects",
        q: "Tell me about a personal project you built outside of work and why you built it.",
        why: "A guide reports personal projects as a topic in the HR round, which shows curiosity and what you pursue without being assigned.",
        frame:
          "Say what problem it addressed, what you learned that work did not teach you, and how far you took it. If it is small, say so honestly. An opening you can adapt: 'I built [project] because I wanted to understand [topic], and the most useful thing I learned was [lesson].'",
        grade: "guide",
        sources: [myntraDesignGurus],
      },
    ],
    offer: [
      "No compensation or notice-period account was found for this company, so nothing is reported here.",
      "As general advice, ask for the complete breakdown of fixed pay, variable pay and any joining terms in writing, check your notice period and buy-out position, and ask about level and band before sharing a figure.",
    ],
    gaps: "No official values page was found; these are the themes candidate reports and guides point to. The senior report shows only a page update date of July 2025 rather than an interview date, and its HR round lists a couple of behavioural questions without details. Only the guide mentions strengths, current responsibilities, API design and personal projects. No compensation account was found.",
  },
];
