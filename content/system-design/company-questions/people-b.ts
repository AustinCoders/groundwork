import type { ReportSource } from "./types";
import type { PeopleSet } from "./people-types";

const razorpayJobs: ReportSource = { label: "Razorpay Jobs", url: "https://razorpay.com/jobs/", kind: "official" };
const razorpayDev: ReportSource = {
  label: "DEV: Frontend interview experience at Razorpay (2021)",
  url: "https://dev.to/anuraghazra/my-frontend-interview-experience-at-razorpay-29bo",
  kind: "candidate-report",
  year: 2021,
};
const razorpayTaro: ReportSource = {
  label: "Taro: Razorpay SDE-2 frontend (India), Nov 2025",
  url: "https://www.jointaro.com/interviews/companies/razorpay/experiences/sde-2-frontend-developer-india-november-16-2025-no-offer-positive-4c3ee6dc/",
  kind: "candidate-report",
  year: 2025,
};
const razorpayTechPrep: ReportSource = {
  label: "TechPrep: Razorpay interview process",
  url: "https://www.techprep.app/blog/razorpay-interview-process",
  kind: "prep-guide",
};
const razorpaySpace: ReportSource = {
  label: "SpaceComplexity: Razorpay software engineer interview",
  url: "https://spacecomplexity.ai/blog/razorpay-software-engineer-interview",
  kind: "prep-guide",
};

const flipkartEarly: ReportSource = {
  label: "Flipkart Early Careers",
  url: "https://flipkartearlycareers.hirepro.in/index.html",
  kind: "official",
};
const flipkartGfg35: ReportSource = {
  label: "GeeksforGeeks: Flipkart SDE-2 (3.5 yrs)",
  url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-for-sde-2-3-5-years-experienced/",
  kind: "candidate-report",
};
const flipkartGfgSde2: ReportSource = {
  label: "GeeksforGeeks: Flipkart SDE-2 experience",
  url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-for-sde-2-3/",
  kind: "candidate-report",
};
const flipkartRoundz: ReportSource = {
  label: "Roundz: Flipkart frontend engineer SDE-2",
  url: "https://roundz.substack.com/p/flipkart-interview-experience-frontend-engineer-sde2",
  kind: "candidate-report",
  year: 2025,
};

const swiggyRoundz: ReportSource = {
  label: "Roundz: Swiggy SDE-3 (L8) experience",
  url: "https://roundz.substack.com/p/interview-experience-123-swiggy-sde3-l8",
  kind: "candidate-report",
  year: 2025,
};
const swiggySpace: ReportSource = {
  label: "SpaceComplexity: Swiggy software engineer interview",
  url: "https://spacecomplexity.ai/blog/swiggy-software-engineer-interview",
  kind: "prep-guide",
};
const swiggyDesignGurus: ReportSource = {
  label: "DesignGurus: Swiggy interview process, round by round",
  url: "https://www.designgurus.io/answers/detail/what-is-the-swiggy-interview-process-like-round-by-round",
  kind: "prep-guide",
};

const phonepeLife: ReportSource = {
  label: "PhonePe: Life at PhonePe",
  url: "https://www.phonepe.com/careers/life-at-phonepe/",
  kind: "official",
};
const phonepe101: ReportSource = {
  label: "Roundz: PhonePe SDE-2 experience 101",
  url: "https://roundz.substack.com/p/interview-experience-101-phonepe-sde2",
  kind: "candidate-report",
  year: 2025,
};
const phonepe174: ReportSource = {
  label: "Roundz: PhonePe SDE-2 experience 174 (Aug 2025)",
  url: "https://roundz.substack.com/p/interview-experience-174-phonepe-sde2",
  kind: "candidate-report",
  year: 2025,
};
const phonepe130: ReportSource = {
  label: "Roundz: PhonePe SDE-2 experience 130 (2022)",
  url: "https://roundz.substack.com/p/interview-experience-130-phonepe-sde2",
  kind: "candidate-report",
  year: 2022,
};
const phonepeGfg: ReportSource = {
  label: "GeeksforGeeks: PhonePe techno-HR round (campus-style report)",
  url: "https://www.geeksforgeeks.org/?p=1048663",
  kind: "candidate-report",
  year: 2023,
};
const phonepeTechPrep: ReportSource = {
  label: "TechPrep: PhonePe interview process",
  url: "https://www.techprep.app/blog/phonepe-interview-process",
  kind: "prep-guide",
};

const zomatoVasanth: ReportSource = {
  label: "CareerWithVasanth: Zomato SDE-2 frontend interview write-up",
  url: "https://www.careerwithvasanth.com/interview-experiences/zomato",
  kind: "prep-guide",
};
const zomatoTechPrep: ReportSource = {
  label: "TechPrep: Zomato interview process",
  url: "https://www.techprep.app/companies/zomato",
  kind: "prep-guide",
};
const zomatoGfg: ReportSource = {
  label: "GeeksforGeeks: Zomato SDE experience (HR plus technical round)",
  url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-for-sde/",
  kind: "candidate-report",
};

const credPapers: ReportSource = {
  label: "PapersAdda: CRED SDE-2 Bangalore 2024 (write-up of a published candidate account)",
  url: "https://papersadda.com/article/cred-sde2-bangalore-2024-payment-processor-offer/",
  kind: "candidate-report",
  year: 2024,
};
const credDesignGurus: ReportSource = {
  label: "DesignGurus: CRED interview process, round by round",
  url: "https://www.designgurus.io/answers/detail/what-is-the-cred-interview-process-like-round-by-round",
  kind: "prep-guide",
};

const meeshoLife: ReportSource = {
  label: "Meesho: Life at Meesho",
  url: "https://www.meesho.io/life",
  kind: "official",
};
const meeshoGfg: ReportSource = {
  label: "GeeksforGeeks: Meesho SDE experience, Oct 2024",
  url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience-for-sde-intern/",
  kind: "candidate-report",
  year: 2024,
};
const meeshoDevsUnite: ReportSource = {
  label: "DevsUnite: Meesho SDE-1 on-campus hiring 2026",
  url: "https://devsunite.com/blog/meesho-sde-1-hiring-experience-2026-on-campus",
  kind: "prep-guide",
  year: 2026,
};
const meeshoPrepInsta: ReportSource = {
  label: "PrepInsta: Meesho interview experience (candidate quotes)",
  url: "https://prepinsta.com/meesho/interview-experience/",
  kind: "prep-guide",
  year: 2025,
};

export const people: PeopleSet[] = [
  {
    company: "razorpay",
    valuesSource: razorpayJobs,
    values: [
      {
        name: "Build Extraordinary",
        line: "Build things at speed, including agents, and be willing to rework existing systems rather than defend them.",
      },
      {
        name: "Grow Extraordinary",
        line: "Expect little hierarchy and reward that follows output, so show what you personally moved.",
      },
      {
        name: "Live Extraordinary",
        line: "Work in a high-trust setting where curiosity is the baseline, so say what you do not yet know.",
      },
      {
        name: "Role Fit",
        line: "The rounds on skills, expertise and how you think about real problems in the role you applied for.",
      },
      {
        name: "Synergy",
        line: "The rounds on how you communicate, collaborate, own outcomes and work with other people.",
      },
      {
        name: "AI Edge",
        line: "The rounds on how you bring AI into your workflow, solve problems and execute day to day.",
      },
    ],
    themes: [
      "Project depth and where past work broke",
      "Technology and trade-off decisions",
      "Disagreement with a peer",
      "Ownership and production issues",
      "Decision making and time management",
      "Motivation and why Razorpay",
      "Compensation expectations and culture at the final call",
    ],
    questions: [
      {
        id: "razorpay-peer-disagreement",
        q: "A teammate proposes a solution you think is wrong. Walk me through what you do, and what you do when you are the one proposing.",
        why: "A frontend candidate reports this pairing in the hiring manager round. The listener is checking the Synergy side of the loop: whether you argue with evidence, stay open to being wrong and still commit once the team decides.",
        frame:
          "Pick a real disagreement where there was a measurable difference between the two options, then show both directions: how you tested their idea fairly and how you made your own easy to challenge. Example opening: 'We split on whether to queue the retries or keep them inline, so I proposed a small load test that would settle it.' Close with what the team did and what you would repeat.",
        book: { round: "r11", qid: "r11-1" },
        grade: "one",
        sources: [razorpayDev],
      },
      {
        id: "razorpay-not-proud",
        q: "What motivates you most, and tell me about a feature you shipped that you are not proud of.",
        why: "Reported as a pair in a frontend loop. The motivation half checks for fit with a fast, high-trust environment; the feature half checks whether you can name a real weakness in your own work without blaming others.",
        frame:
          "Give the motivation in one sentence tied to the work itself, then spend most of the time on the feature: what was cut or rushed, what the user or system paid for it, and what you changed afterwards. Example opening: 'I am most motivated when I can see a number move because of something I built, and the worst example of the opposite was a settings screen I shipped without ever measuring.'",
        book: { round: "r10", qid: "r10-3" },
        grade: "one",
        sources: [razorpayDev],
      },
      {
        id: "razorpay-conflict-decisions",
        q: "How do you resolve conflict in a team, how do you reach decisions, and how do you manage your time?",
        why: "The same frontend candidate says the hiring manager round assessed conflict resolution and decision making, and mentions a preferred way of managing time. The listener wants a repeatable method for each, not three slogans, and evidence that the methods survive pressure.",
        frame:
          "Answer in three short parts, each with a method and a one-line proof from your own work that you pick beforehand. For decisions, name how you separate reversible from irreversible choices. Example opening: 'For conflict I try to move the argument from opinions to a shared test, and the clearest case of that for me was...'",
        grade: "one",
        sources: [razorpayDev],
      },
      {
        id: "razorpay-project-ownership",
        q: "Take me through a project you owned: how you handled production problems and who you worked with along the way.",
        why: "A frontend SDE-2 candidate describes a conversational deep dive on ownership, production issues and collaboration. The listener is checking that the work is genuinely yours and that you stayed accountable after launch.",
        frame:
          "Structure it as scope, your decisions, the incident or near miss, and what changed in the process afterwards. Be exact about which parts were yours and which were shared. Example opening: 'I owned the checkout flow for about a year, and the incident that shaped how I work on it was a bad release that we caught through error rates rather than support tickets.'",
        book: { round: "r10", qid: "r10-5" },
        grade: "one",
        sources: [razorpayTaro],
      },
      {
        id: "razorpay-why-here",
        q: "Why Razorpay, and how would you handle a disagreement with another team that you depend on?",
        why: "Guides describe a why-here question paired with situational prompts on conflict and cross-team work. The listener checks whether your interest in payments is specific and whether you can work across boundaries.",
        frame:
          "Anchor the why in something concrete about the product or the problems of payments reliability, not a general praise of the brand. For the situation, describe how you would find the other team's constraint first. Example opening: 'What draws me is that a small failure here is someone's missed payment, which changes how I think about retries and idempotency.'",
        book: { round: "r11", qid: "r11-3" },
        grade: "guide",
        sources: [razorpayTechPrep],
      },
      {
        id: "razorpay-uncertainty",
        q: "Describe a decision you made with incomplete information, and a time you disagreed with a technical peer. Use numbers.",
        why: "A prep guide describes the behavioural round as wanting specifics. The listener is checking that you can quantify the stakes, name what you did not know and show how the decision looked afterwards.",
        frame:
          "Choose a decision where you can state two or three real figures such as traffic, latency or error rate, before and after. Say what you did not know and how you limited the downside. Example opening: 'We had a week and no load data, so I picked the option that was cheapest to reverse and set an alert that would tell us within a day if it was wrong.'",
        grade: "guide",
        sources: [razorpaySpace],
      },
      {
        id: "razorpay-ai-workflow",
        q: "How have you brought AI tools into your own engineering work, and where did they let you down?",
        why: "The official hiring page names AI Edge as a round family. The listener wants to see practical use, judgement about where it fails and responsibility for the final result.",
        frame:
          "Describe one workflow in which you used AI, how you checked its output and one case where you rejected it. Keep it about outcomes rather than tools. Example opening: 'I use it to draft test cases for edge conditions, and I always run them against the real code before trusting either, because it once produced tests that passed for the wrong reason.'",
        grade: "guide",
        sources: [razorpayJobs],
      },
    ],
    offer: [
      "A prep guide describes a short final call of 15 to 30 minutes on compensation expectations and company culture, and says a verbal offer often follows within a few days, with the whole process taking 2 to 4 weeks.",
      "As general advice, ask for the full breakdown in writing (fixed pay, variable, joining bonus, equity and its vesting) before comparing it with anything else.",
      "Ask which level and band the role sits in and how it was decided. Know your notice period and whether a buy-out is possible before the call, and give a total compensation range only when pressed.",
    ],
    gaps: "The jobs page presents three culture pillars and three hiring round families rather than a classic values list, so Role Fit, Synergy and AI Edge are round families, not values. The dev.to account is from 2021, and the Taro one is a short frontend snippet with no question detail. No first-hand report of the compensation call or of notice-period handling was found.",
  },
  {
    company: "flipkart",
    valuesSource: flipkartEarly,
    values: [
      {
        name: "Audacity",
        line: "Think big, take bold bets and be ready to change how the problem is framed.",
      },
      {
        name: "Bias for Action",
        line: "Work with urgency and solve problems with a plan, not by waiting for perfect information.",
      },
      {
        name: "Customer First",
        line: "Judge decisions from the point of view of the person using the product.",
      },
      {
        name: "Integrity",
        line: "Do the right thing and follow through on what you said you would do.",
      },
      {
        name: "Inclusion",
        line: "Respect differences, value each person's uniqueness and help others feel they belong.",
      },
    ],
    themes: [
      "Team conflict and conflict with a manager",
      "Team size and responsibilities",
      "A challenging project, with context and impact",
      "Recent learning",
      "Why Flipkart and what you want next",
      "Strengths and weaknesses",
      "Mentoring",
      "Product improvement ideas",
    ],
    questions: [
      {
        id: "flipkart-why-here",
        q: "Why Flipkart, and what are you looking for in your next role?",
        why: "Two SDE-2 candidates report this in the hiring manager conversation. The listener is checking that your reasons are specific to the company and that what you want next matches what the team can give.",
        frame:
          "Give two reasons, one about the scale or kind of problems and one about what you want to grow into, and make the second one realistic for the team. Example opening: 'I want to work on systems where a small latency change affects a very large number of orders, and I am looking for a role where I lead a feature rather than only build it.'",
        book: { round: "r11", qid: "r11-3" },
        grade: "several",
        sources: [flipkartGfg35, flipkartGfgSde2],
      },
      {
        id: "flipkart-team-conflict",
        q: "Tell me about a conflict in your team and how it was resolved, and whether you have had one with your manager.",
        why: "A 3.5 year candidate reports both halves. The listener checks that you can disagree upward without damaging trust, which fits the Integrity and Inclusion values.",
        frame:
          "Pick one conflict with a clear cause and an outcome you can describe in one sentence. Then give a shorter second example involving a manager, focused on how you raised it privately and what you offered. Example opening: 'My manager and I disagreed on the deadline, so I brought a breakdown of what could ship and what would slip.'",
        book: { round: "r11", qid: "r11-1" },
        grade: "one",
        sources: [flipkartGfg35],
      },
      {
        id: "flipkart-learning-weakness",
        q: "What is the most recent thing you learned that excited you, and what are your technical strengths and weaknesses?",
        why: "Reported in the same hiring manager round. The listener is checking whether you keep learning and whether your self-assessment is honest enough to trust.",
        frame:
          "Choose a learning that changed how you work and say what you did with it. For the weakness, name a real gap and the habit you use to close it. Example opening: 'Recently I learned how our database picks query plans, and it changed how I review indexes, though I am still weaker at capacity planning, so I shadow our platform team on it.'",
        grade: "one",
        sources: [flipkartGfg35],
      },
      {
        id: "flipkart-awake-improve-app",
        q: "What keeps you awake at night in your current work, and what would you improve in the Flipkart app?",
        why: "One SDE-2 candidate reports these two prompts. The first checks what you worry about and therefore what you own; the second checks product sense, which ties to Customer First.",
        frame:
          "For the first, name a real operational or quality risk and what you have done about it. For the second, pick one flow, state the user problem, the change and how you would measure it. Example opening: 'What worries me is our retry storm risk during sale traffic, and the one change I would test in the app is...'",
        grade: "one",
        sources: [flipkartGfgSde2],
      },
      {
        id: "flipkart-mentoring-conflict",
        q: "How do you mentor less experienced engineers, and how do you handle a conflict inside the team?",
        why: "A frontend SDE-2 report lists mentoring and conflict handling among the people topics, next to web security and performance questions. The listener is checking whether you raise the people around you.",
        frame:
          "Describe one person you helped, what they could not do at the start, what you changed in how you worked with them and how you knew it helped. Example opening: 'I started pairing with a new joiner twice a week on review comments, and within a quarter they were reviewing others.'",
        grade: "one",
        sources: [flipkartRoundz],
      },
      {
        id: "flipkart-architecture-why",
        q: "Why did you pick the architecture of your current application, and why not an alternative?",
        why: "A candidate reports being pushed to justify the architecture of a current app. The listener is checking whether you understand the trade-off or only inherited it.",
        frame:
          "Name the constraint that drove the choice, the main alternative you or the team weighed and what you gave up. Be ready to say when you would reverse it. Example opening: 'We chose a single service because the team was four people, and I would split it once deploys start blocking each other.'",
        book: { round: "r10", qid: "r10-2" },
        grade: "one",
        sources: [flipkartGfgSde2],
      },
      {
        id: "flipkart-bias-for-action",
        q: "Tell me about a time you acted quickly on a problem without having all the information.",
        why: "Bias for Action is a stated value, and the early-careers page says each stage combines technical, functional and value-based assessment. The listener checks that speed came with a plan and a way to undo the choice.",
        frame:
          "Pick a time pressure with a real cost of waiting, say what you decided and how you kept it reversible, and report the result. Example opening: 'A fix was needed before a sale started, so I shipped the smallest safe change behind a flag and scheduled the proper fix for after.'",
        grade: "guide",
        sources: [flipkartEarly],
      },
    ],
    offer: [
      "One SDE-2 candidate (2 years of experience) reports a call about selection within three days and a whole process of about ten days, because they were already serving notice.",
      "No first-hand report of the compensation conversation was found, so treat this as general advice: ask for the full breakdown in writing, ask about the level and band, and confirm what the notice period and any buy-out would be.",
      "Where the company allows, let them state a figure first, and answer with total compensation rather than base pay.",
    ],
    gaps: "The values page is the Flipkart Early Careers site, so it may describe campus hiring more than experienced hiring. No dedicated HR round report or first-hand compensation conversation was found. The GeeksforGeeks pages show only a last-updated date, not an interview date, and one of the pages quoted for the process timeline dates from 2021.",
  },
  {
    company: "swiggy",
    values: [
      {
        name: "Ownership and initiative",
        line: "Candidates report being probed on projects where you acted without waiting to be told.",
      },
      {
        name: "End to end delivery",
        line: "Reported prompts focus on leading a feature from idea to production, not just one piece.",
      },
      {
        name: "Candid disagreement",
        line: "Reported questions cover how you handle disagreement in technical decisions.",
      },
      {
        name: "Comfort with ambiguity",
        line: "Guides describe questions on incomplete requirements and unclear scope.",
      },
      {
        name: "Production accountability",
        line: "One candidate reports short questions on on-call culture and how production issues are handled.",
      },
    ],
    themes: [
      "Ownership and initiative",
      "Leading a feature end to end",
      "Technical disagreement and conflict",
      "Ambiguity and incomplete requirements",
      "Why Swiggy and decisions you owned",
      "On-call and production culture",
      "Motivation, notice period and logistics at HR",
    ],
    questions: [
      {
        id: "swiggy-ownership-end-to-end",
        q: "Tell me about a project where you showed ownership and led a feature from start to finish.",
        why: "An SDE-3 candidate reports prompts on ownership, initiative and driving a feature end to end. The listener is checking whether you carry work past your own task, including the unglamorous parts.",
        frame:
          "Use a feature with a beginning, a launch and a follow-up. Say what you decided, who you had to bring along and what you did after release. Example opening: 'Nobody had been assigned the rollout plan for the new flow, so I wrote it, ran the dry run and watched the first day of traffic myself.'",
        book: { round: "r11lp", qid: "r11lp-4" },
        grade: "one",
        sources: [swiggyRoundz],
      },
      {
        id: "swiggy-technical-disagreement",
        q: "Describe a technical decision where you and someone else disagreed, and how it was settled.",
        why: "The same SDE-3 account lists disagreement in technical decisions. The listener checks that you argue from evidence, respect the person and can accept the outcome.",
        frame:
          "State both positions fairly, name the evidence that moved the decision and what you did once it was made, including when it went against you. Example opening: 'We disagreed about caching at the service level versus the client, so we measured the hit rate on real traffic.'",
        book: { round: "r11", qid: "r11-1" },
        grade: "one",
        sources: [swiggyRoundz],
      },
      {
        id: "swiggy-on-call",
        q: "How do you handle production issues, and what does good on-call practice look like to you?",
        why: "A candidate reports short questions on on-call culture and production issues at the end of a problem-solving round. The listener is checking that you have been accountable for live systems and have views on reducing repeat incidents.",
        frame:
          "Walk through your own routine: detect, limit the damage, communicate, fix, then review. End with one change that prevented a repeat. Example opening: 'My first move is to stop the bleeding with a rollback or a flag, and only then to look for the cause.'",
        book: { round: "r11", qid: "r11-2" },
        grade: "one",
        sources: [swiggyRoundz],
      },
      {
        id: "swiggy-ambiguity",
        q: "Tell me about a time the requirements were unclear or incomplete, and what you did.",
        why: "A guide describes behavioural questions on ambiguity, disagreement and incomplete requirements. The listener checks whether you make progress under uncertainty rather than waiting.",
        frame:
          "Show how you turned vague scope into questions, assumptions and a first small deliverable that tested them. Example opening: 'The brief said make delivery estimates better, so I first asked which estimate customers were complaining about.'",
        grade: "guide",
        sources: [swiggySpace],
      },
      {
        id: "swiggy-projects-why",
        q: "Which decisions on your recent projects did you own, and why are you applying here?",
        why: "A guide describes the opening conversation as projects, decisions you owned and reasons for applying. The listener separates your decisions from those of the team and checks that your reasons are specific.",
        frame:
          "Pick two decisions, state the alternative you rejected and the result, then give a reason for applying tied to the kind of problems in food or quick commerce logistics. Example opening: 'On the last project I owned the choice of queue and the retry policy, and I rejected the simpler option because...'",
        book: { round: "r11", qid: "r11-3" },
        grade: "guide",
        sources: [swiggyDesignGurus],
      },
    ],
    offer: [
      "One SDE-3 candidate reports being first offered SDE-2 at the high end of the band and the offer being revised to SDE-3 after they received a competing offer from another company; the process took about a month.",
      "A guide says some reports add a short HR round of 20 to 30 minutes on motivation, notice period and logistics, and that its content varies by level and team.",
      "As general advice, ask early what level the role is scoped at, get the full breakdown in writing, and keep any competing offer in writing too.",
    ],
    gaps: "No official values page that names the values could be read, so the entries above are the themes candidates and guides point to. Only one first-hand report was read (SDE-3, 2025), and the two guides give no first-hand detail on the HR round.",
  },
  {
    company: "phonepe",
    valuesSource: phonepeLife,
    values: [
      {
        name: "Integrity and honesty",
        line: "Treat honesty as the price of admission and keep politics, dishonesty and discrimination out of how you work.",
      },
      {
        name: "Audacious goals",
        line: "Set goals beyond incremental thinking and take calculated risks, celebrating both success and failure.",
      },
      {
        name: "Quality of output",
        line: "Focus on the quality and impact of your output rather than on being busy.",
      },
      {
        name: "Transparency",
        line: "Share data and learnings openly so decisions across the company get better.",
      },
      {
        name: "Open-minded and candid",
        line: "Voice opinions even when they are uncomfortable, admit mistakes and stay open to being influenced by data and logic.",
      },
      {
        name: "Customer first",
        line: "Treat the customer as the first stakeholder and build the best solution from first principles.",
      },
      {
        name: "Curiosity and learning",
        line: "Stay curious about new possibilities and act on them.",
      },
      {
        name: "Full ownership",
        line: "Take complete ownership of resolving problems across team boundaries and never say it is not your job.",
      },
    ],
    themes: [
      "Depth on your current project architecture",
      "Why you are leaving and what you expect",
      "Why PhonePe",
      "Design trade-offs and monitoring",
      "A recent argument and how it was handled",
      "Non-programming problems solved",
      "Conflict with a product manager",
      "Compensation expectations after the loop",
    ],
    questions: [
      {
        id: "phonepe-leaving-expectations",
        q: "Why are you leaving your current company, what do you expect from the next one and why PhonePe?",
        why: "An SDE-2 candidate reports these three together and says the manager was not fully convinced by the motivation. The listener is testing whether your reasons are positive, specific and consistent with the role.",
        frame:
          "Lead with what you want to move toward, then a short, neutral account of what you have outgrown, then something particular about the product or scale. Avoid criticising people. Example opening: 'I have learned what I can from my current scope, and I want to work on a payments system where reliability is the product.'",
        book: { round: "r11", qid: "r11-3" },
        grade: "one",
        sources: [phonepe101],
      },
      {
        id: "phonepe-architecture",
        q: "Walk me through the architecture of your current project: what you would improve, why that database and how it handles load.",
        why: "An August 2025 candidate reports questions on improvements, database choice, replication and sharding, load, consumers of the API, team size and timeline. The listener is checking that the depth is real and the numbers are yours.",
        frame:
          "Draw it in order of data flow, give request rate, data size and team size, then name one thing you would change and why. Example opening: 'It is a service with one writer and read replicas, handling about this many requests at peak, and the first thing I would change is how we shard.'",
        book: { round: "r10", qid: "r10-2" },
        grade: "one",
        sources: [phonepe174],
      },
      {
        id: "phonepe-constraints-monitoring",
        q: "Talk me through past projects: the design decisions, the real-world constraints and how you monitored the service.",
        why: "A 2022 report describes a hiring manager round that probes decisions and constraints closely. The listener is checking whether you know why choices were made and how you would notice a failure.",
        frame:
          "For each decision give the constraint, the options and the signal that tells you it still holds, such as a dashboard or alert. Example opening: 'We had no budget for a second region, so the decision was to design for fast recovery, and we monitored failover time as a metric.'",
        grade: "one",
        sources: [phonepe130],
      },
      {
        id: "phonepe-recent-argument",
        q: "Who did you have a recent argument with, what was it about and how did you handle it?",
        why: "A report of a techno-HR round (campus-style, so treat it cautiously) includes this prompt. The listener checks maturity, candour and whether you can be persuaded, which matches the open-minded and candid theme.",
        frame:
          "Choose a low-drama, real disagreement where you can describe your own part honestly. Show what you asked, what you heard and what changed. Example opening: 'We argued about whether to ship with a known edge case, and I asked what the cost would be if we waited.'",
        book: { round: "r11", qid: "r11-1" },
        grade: "one",
        sources: [phonepeGfg],
      },
      {
        id: "phonepe-beyond-programming",
        q: "What real-world problem have you solved that was not a programming problem?",
        why: "The same techno-HR report includes problems beyond code and non-tech interests. The listener is checking curiosity and whether you apply structured thinking outside your function.",
        frame:
          "Pick a problem with a clear before and after, such as a process, a community task or a cost. Show how you broke it down. Example opening: 'Our team spent hours on release coordination, so I mapped the steps and removed three that nobody needed.'",
        grade: "one",
        sources: [phonepeGfg],
      },
      {
        id: "phonepe-hardest-bug",
        q: "What is the hardest bug you have solved, and how did you find it?",
        why: "A prep guide gives this as an example prompt in the hiring manager round. The listener is checking your debugging method and whether you can explain a technical story clearly to a non-specialist.",
        frame:
          "Describe symptom, hypotheses, how you narrowed it down and the fix, then the safeguard you added. Example opening: 'Payments were failing for a small slice of users, and the clue was that it only happened after a particular retry.'",
        grade: "guide",
        sources: [phonepeTechPrep],
      },
      {
        id: "phonepe-product-manager",
        q: "Tell me about a conflict with a product manager and how you resolved it.",
        why: "The same prep guide gives a conflict with a product manager as an example prompt. The listener is checking whether you can negotiate scope and risk with non-engineers while keeping the customer in view.",
        frame:
          "Describe the competing goals, what each side was protecting and the compromise you reached with data. Example opening: 'The product manager wanted the feature in two weeks and I was worried about reconciliation, so we agreed on a smaller launch with a guard.'",
        book: { round: "r11lp", qid: "r11lp-5" },
        grade: "guide",
        sources: [phonepeTechPrep],
      },
    ],
    offer: [
      "An August 2025 SDE-2 candidate reports being asked for expected compensation after four rounds, and says the company could not match the figure quoted; the page is inconsistent on whether the offer was declined or never issued.",
      "A June 2025 SDE-2 candidate's preparation notes suggest avoiding personal expectations early and discussing total compensation during negotiation; this is that candidate's advice, not a company rule.",
      "A prep guide describes a closing conversation of about 30 minutes on culture fit and pay expectations. As general advice, find out the band before you quote a number.",
    ],
    gaps: "The Our Values section of the Life page shows its statements without individual titles, so the names above are editorial labels and the lines paraphrase the statements. No official process page was read, and the techno-HR report is a 2023 campus loop that may not match experienced hiring.",
  },
  {
    company: "zomato",
    values: [
      {
        name: "Defending decisions",
        line: "A write-up says the hiring manager round expects you to defend architecture decisions when they are challenged.",
      },
      {
        name: "Ownership mindset",
        line: "A guide describes high ownership in a fast-moving environment, including moving work from idea to production without waiting for permission.",
      },
      {
        name: "Customer focus",
        line: "The same guide lists customer focus, lean engineering and scrappiness as things to show through decisions you made.",
      },
      {
        name: "Specific motivation",
        line: "A write-up places why Zomato in the HR round, with scale, hyperlocal tech, consumer impact and culture as angles.",
      },
      {
        name: "Practical logistics",
        line: "A write-up lists current and expected pay, notice period and relocation in a 30 minute HR round.",
      },
    ],
    themes: [
      "Defending architecture under pushback",
      "Ownership and a founder's mindset",
      "Customer focus",
      "Why Zomato",
      "Current and expected pay, notice period and relocation",
      "Introductions and projects in a campus round",
    ],
    questions: [
      {
        id: "zomato-defend-architecture",
        q: "Defend an architecture decision you made when the interviewer pushes back on it.",
        why: "A frontend SDE-2 write-up says the 60 minute hiring manager round expects you to defend your architecture decisions when challenged. The listener is checking whether you hold a reasoned position, concede real flaws and stay calm.",
        frame:
          "Know the constraint behind each decision and the alternative you rejected. Concede a valid point out loud and say what it would change. Example opening: 'That is a fair challenge, and the reason I chose it was the team size at the time, though at larger scale I would revisit it.'",
        book: { round: "r10", qid: "r10-2" },
        grade: "guide",
        sources: [zomatoVasanth],
      },
      {
        id: "zomato-why-here",
        q: "Why Zomato specifically?",
        why: "The same write-up places this question in the HR round and suggests answering with scale, hyperlocal tech, consumer impact and culture. The listener is checking that your interest is specific to the company and the product, not generic enthusiasm for food delivery.",
        frame:
          "Give one product observation you have actually made and one reason it fits your skills or the pace you want. Example opening: 'I notice how often the app has to be right within a few minutes, and that time pressure is the kind of engineering problem I enjoy.'",
        book: { round: "r11", qid: "r11-3" },
        grade: "guide",
        sources: [zomatoVasanth],
      },
      {
        id: "zomato-ownership-beyond-role",
        q: "Tell me about a time you took on something outside your role because it needed doing.",
        why: "A guide describes high ownership in a fast-moving environment as something the culture round checks. The listener checks that you step in without ignoring your main work and that you finish what you start.",
        frame:
          "Describe what was falling through the gaps, why you took it, how you protected your main work and what happened after. Example opening: 'No team owned the alerting for that flow, so I wrote the first alerts and handed the runbook to the on-call group.'",
        book: { round: "r11lp", qid: "r11lp-4" },
        grade: "guide",
        sources: [zomatoTechPrep],
      },
      {
        id: "zomato-intro-projects",
        q: "Introduce yourself and tell me about the projects you have done.",
        why: "A Covid-era online campus report says its combined HR and technical round began with introductions and later asked about projects. The listener uses the introduction to choose where to probe, so your summary decides the rest of the conversation.",
        frame:
          "Spend about a minute on who you are and your strongest project, mentioning the one or two things you are ready to go deep on. Example opening: 'I am a backend engineer with three years in order systems, and the project I know best is a rewrite of our retry logic.'",
        grade: "one",
        sources: [zomatoGfg],
      },
      {
        id: "zomato-customer-call",
        q: "Tell me about a decision where you put the end customer ahead of the easier engineering choice.",
        why: "A guide names customer focus and a founder's mindset as themes. The listener checks that you notice effects on real users and are willing to do extra work for them.",
        frame:
          "Describe the customer problem you noticed, the cheaper option you passed over and a result you can point to. Example opening: 'Support tickets showed customers were confused by a failed state, so I changed the message and the retry flow rather than closing the ticket.'",
        grade: "guide",
        sources: [zomatoTechPrep],
      },
      {
        id: "zomato-hr-logistics",
        q: "What is your current pay, what do you expect, what is your notice period and would you relocate?",
        why: "A frontend SDE-2 write-up lists a 30 minute HR round on these four topics, though its pay and notice-period claims are the author's own and unsourced. The listener is checking fit and timing, so prepare factual answers.",
        frame:
          "Know your notice period, whether a buy-out is possible and your relocation limits before the call. Give a range for total pay only when pressed and ask about the band first. Example opening: 'My notice period is two months, and I can discuss an earlier release if the offer is confirmed.'",
        book: { round: "r12", qid: "r12-3" },
        grade: "guide",
        sources: [zomatoVasanth],
      },
    ],
    offer: [
      "A frontend SDE-2 write-up lists a 30 minute HR round on current pay, expected pay, notice period and relocation, and another guide describes a 20 to 30 minute HR and offer round on pay, timelines and next steps.",
      "The first write-up gives pay bands and notice-period expectations of its own that it does not source, so do not anchor on them.",
      "As general advice, ask for the full breakdown and level in writing, and treat any notice-period promise as something to confirm with your current employer first.",
    ],
    gaps: "No official values or hiring process page was read, so the entries above are themes from two guides. The frontend write-up reads partly like a guide and gives no interview date, and the only first-hand report is an undated Covid-era campus round, so no experienced-hire first-hand account was read.",
  },
  {
    company: "cred",
    values: [
      {
        name: "Explaining your decisions",
        line: "A guide quotes a CRED engineering leader on being ready to explain a decision and the reason behind it.",
      },
      {
        name: "Ownership",
        line: "Reported behavioural and managerial rounds cover ownership of what you have built.",
      },
      {
        name: "Teamwork and communication",
        line: "A guide describes questions on teamwork and communication with an engineering lead.",
      },
      {
        name: "Career direction",
        line: "Reported conversations include where you want your career to go.",
      },
    ],
    themes: [
      "Project deep dive",
      "Ownership and teamwork",
      "Behavioural questions",
      "Career direction",
      "Explaining the reason behind a decision",
      "A light design problem with schema and failure handling",
    ],
    questions: [
      {
        id: "cred-project-design-behavioural",
        q: "Walk me through a project you worked on, including the design decisions and your part in the team.",
        why: "A write-up of a July 2024 SDE-2 account describes a 60 minute hiring manager round with a lighter design problem, a project deep dive with adversarial questions on trade-offs and behavioural questions on leadership and conflict. The listener is checking that the project is genuinely yours.",
        frame:
          "Give the goal, your contribution, two design decisions with the alternative you rejected and the result. Example opening: 'The aim was to cut settlement delays, I owned the ingestion service and the main decision was to make it idempotent.'",
        book: { round: "r10", qid: "r10-2" },
        grade: "one",
        sources: [credPapers],
      },
      {
        id: "cred-design-failure",
        q: "For the design you just described, what does the schema look like and what happens when a step fails?",
        why: "A guide says some reports include technical discussion of schema design and failure handling in this conversation. The listener is checking whether you think about partial failure and data consistency rather than only the happy path.",
        frame:
          "State the key entities, the status transitions and what is retried or reconciled when something breaks. Example opening: 'Each attempt gets its own record with a status, so a failure leaves a trail that a retry job can safely pick up.'",
        grade: "one",
        sources: [credPapers],
      },
      {
        id: "cred-explain-decision",
        q: "Pick a decision you made and explain why you made it, including what you knew at the time.",
        why: "A guide quotes a CRED engineering leader advising candidates to be ready to explain a decision and the reason behind it. The listener checks that your reasoning was sound given what you knew, not only that the result was good.",
        frame:
          "Separate the facts you had, the options, your choice and what you would decide differently now. Example opening: 'With the information we had, I chose the simpler path because it was reversible, and I would still make that choice.'",
        grade: "guide",
        sources: [credDesignGurus],
      },
      {
        id: "cred-teamwork-comms",
        q: "How do you work with teammates and keep an engineering lead informed about your progress?",
        why: "A guide describes questions on teamwork and communication with an engineering lead. The listener is checking how early you surface risk and whether you communicate clearly.",
        frame:
          "Describe your actual cadence, such as short written updates, early flags when something slips and how you ask for help. Example opening: 'I send a short note when a plan changes, not at the end of the week, because the lead can still act on it then.'",
        book: { round: "r11", qid: "r11-1" },
        grade: "guide",
        sources: [credDesignGurus],
      },
      {
        id: "cred-ownership",
        q: "Tell me about something you owned from start to finish, and what you would do differently.",
        why: "A guide lists ownership as part of the managerial round. The listener checks that you stayed responsible after delivery and can reflect honestly.",
        frame:
          "Cover the problem, your decisions, how you measured success and one improvement you would make now. Example opening: 'I owned the reconciliation job from design to on-call, and the thing I would change is how early I added monitoring.'",
        book: { round: "r11lp", qid: "r11lp-4" },
        grade: "guide",
        sources: [credDesignGurus],
      },
      {
        id: "cred-career-direction",
        q: "Where do you want your career to go over the next few years, and why does this role fit?",
        why: "A guide lists career direction as a topic with the engineering lead. The listener is checking that your goals are realistic and that the role helps you reach them.",
        frame:
          "Tie your direction to skills you are building, such as depth in one domain or leading a small group, and show how this role gives you practice. Example opening: 'I want to be the person who owns reliability for a payment flow, and this role would give me that scope.'",
        book: { round: "r11", qid: "r11-4" },
        grade: "guide",
        sources: [credDesignGurus],
      },
    ],
    offer: [
      "One July 2024 SDE-2 candidate received an offer, after which compensation negotiations did not work out and they did not join. The page is a write-up of a post by another author that was not itself read, and it gives no figures.",
      "No account of the HR conversation was found, so treat the rest as general advice: ask for the full breakdown of fixed pay, variable and equity in writing, and ask which level and band the role sits in.",
      "Check the base-versus-equity trade-off carefully before negotiating, and settle the notice period and any buy-out early.",
    ],
    gaps: "No official values page or process page was read, so the entries above are themes from reports and a guide. Only one candidate account is cited, as a secondary write-up of a post by another author that was not read, and the HR round has no candidate account.",
  },
  {
    company: "meesho",
    valuesSource: meeshoLife,
    values: [
      {
        name: "Tech-first organization",
        line: "Technology sits at the centre of the company, built problem first and at large scale.",
      },
      {
        name: "Building for a billion Indians",
        line: "A stated promise about the scale and audience of the work, so think about reach and cost.",
      },
      {
        name: "Exceptional people, high autonomy",
        line: "A promise of strong colleagues and independence, so be ready to show self-direction.",
      },
    ],
    themes: [
      "Situational questions, then a project deep dive",
      "Teamwork and disagreement",
      "Tech-stack choice",
      "Why Meesho and improving a feature",
      "Task prioritisation and deadlines",
      "Failure and long-term goals at HR",
    ],
    questions: [
      {
        id: "meesho-situational-project",
        q: "Walk me through your project after a few situational questions about how you work.",
        why: "A candidate on an intern-titled page reports a 45 minute hiring manager round of introductions, situational questions and a project deep dive. The listener is checking that your answers to the scenarios and your project line up.",
        frame:
          "Keep the introduction short, then give the project in order of goal, your role, the hardest decision and the outcome. Example opening: 'The project was a recommendation feed, my part was the ranking service and the hardest call was how to cache it.'",
        book: { round: "r10", qid: "r10-1" },
        grade: "one",
        sources: [meeshoGfg],
      },
      {
        id: "meesho-best-project-stack",
        q: "Take me through your best project and explain why you chose that stack.",
        why: "A guide to the campus loop lists this prompt. The listener checks whether you chose the tools for reasons and understand what the alternatives would have cost.",
        frame:
          "Name the requirement that pushed you to the stack, one alternative and why you set it aside. Example opening: 'We needed fast reads at low cost, which is why I picked this store over the relational option.'",
        grade: "guide",
        sources: [meeshoDevsUnite],
      },
      {
        id: "meesho-teammate-disagreement",
        q: "Tell me about a time you disagreed with a teammate.",
        why: "A guide to the campus loop lists teamwork and disagreement. The listener is checking that you can disagree without making it personal, which matters in a high-autonomy culture.",
        frame:
          "Describe the question you disagreed on, what each of you wanted, how you tested it and what you learned. Example opening: 'My teammate wanted to rewrite the module and I wanted to refactor, so we compared the effort on one small part.'",
        book: { round: "r11", qid: "r11-1" },
        grade: "guide",
        sources: [meeshoDevsUnite],
      },
      {
        id: "meesho-why-improve-feature",
        q: "Why Meesho, and how would you improve one of our features?",
        why: "The same guide lists both. The listener is checking whether you have used the product and can reason about users who are very different from you, which ties to the stated focus on reach.",
        frame:
          "Pick one feature, name the user problem, your change and how you would know it worked. Mention price or connectivity constraints if relevant. Example opening: 'Many users are on slow connections, so I would test a lighter product page and measure drop-off.'",
        book: { round: "r11", qid: "r11-3" },
        grade: "guide",
        sources: [meeshoDevsUnite],
      },
      {
        id: "meesho-prioritise-deadline",
        q: "How do you prioritise across several projects, and what do you do when a deadline is tight?",
        why: "A compilation of candidate accounts lists prioritisation and tight deadlines in the hiring manager round. The listener checks that you have a method and communicate trade-offs rather than quietly working longer.",
        frame:
          "Describe how you rank by impact and urgency, who you tell and what you cut. Example opening: 'When two things collide I ask which one has a customer or a date attached, then I tell the owner of the other what will slip.'",
        grade: "guide",
        sources: [meeshoPrepInsta],
      },
      {
        id: "meesho-failure-goals",
        q: "How do you handle failure, and what are your long-term goals?",
        why: "The same compilation places these in the HR round. The listener checks resilience, honesty about mistakes and whether your goals are compatible with the role.",
        frame:
          "Give one failure with its cost and a change you made, then a goal that links to skills this role builds. Example opening: 'I once shipped a change without a rollback plan, and now I never merge without one.'",
        book: { round: "r11", qid: "r11-4" },
        grade: "guide",
        sources: [meeshoPrepInsta],
      },
      {
        id: "meesho-autonomy",
        q: "Tell me about a time you worked with little direction and decided for yourself what to do.",
        why: "The official Life page promises high autonomy. The listener is checking that you can pick a direction, explain it and ask for help at the right moment.",
        frame:
          "Describe the vague goal, the choice you made, how you checked it and when you asked for input. Example opening: 'I was told to improve search quality with no brief, so I started by listing the failing queries.'",
        grade: "guide",
        sources: [meeshoLife],
      },
    ],
    offer: [
      "A virtual-campus SDE-1 candidate describes the HR round as just a formality in which nothing was asked; this is a single campus account and may not match experienced hiring.",
      "No account of a compensation or notice-period conversation for experienced hires was found, so treat this as general advice: ask for the full breakdown in writing and ask which level and band the role sits in.",
      "Know your notice period and any buy-out before the call, and give a total compensation range only if the recruiter asks first.",
    ],
    gaps: "The company's named values (mantras) were not found on a readable page, so the three entries are promise headings from the Life page (five promises are listed, three used here). The GeeksforGeeks pages show only a last-updated date, campus and intern reports dominate, and the two guides give no first-hand detail. No experienced-hire HR or compensation account was read.",
  },
];
