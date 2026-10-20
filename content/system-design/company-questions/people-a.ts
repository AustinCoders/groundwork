import type { ReportSource } from "./types";
import type { PeopleSet } from "./people-types";

const googlePhilosophy: ReportSource = {
  label: "Google: Ten things we know to be true",
  url: "https://about.google/philosophy/",
  kind: "official",
};
const gfgGoogle: ReportSource = {
  label: "GeeksforGeeks: Google SDE-2 (Bangalore) experience",
  url: "https://www.geeksforgeeks.org/interview-experiences/google-interview-experience-for-software-engineer-sde-2-2025/",
  kind: "candidate-report",
  year: 2025,
};
const acedGoogle: ReportSource = {
  label: "Aced: Google SWE interview guide",
  url: "https://www.aced.io/guides/google-software-engineer-interview",
  kind: "prep-guide",
};
const helloGoogle: ReportSource = {
  label: "Hello Interview: Google L4 guide",
  url: "https://www.hellointerview.com/guides/google/l4",
  kind: "prep-guide",
};

const msValues: ReportSource = {
  label: "Microsoft: Corporate values",
  url: "https://www.microsoft.com/en-us/about/corporate-values",
  kind: "official",
};
const msHiringTips: ReportSource = {
  label: "Microsoft Careers: Hiring tips",
  url: "https://careers.microsoft.com/v2/global/en/hiring-tips.html",
  kind: "official",
};
const helloMs: ReportSource = {
  label: "Hello Interview: Microsoft guide",
  url: "https://www.hellointerview.com/guides/microsoft",
  kind: "prep-guide",
};
const ioMs: ReportSource = {
  label: "interviewing.io: Microsoft interview process",
  url: "https://interviewing.io/guides/hiring-process/microsoft",
  kind: "prep-guide",
};
const techprepMs: ReportSource = {
  label: "TechPrep: Microsoft interview process",
  url: "https://www.techprep.app/blog/microsoft-interview-process",
  kind: "prep-guide",
};
const acedMs: ReportSource = {
  label: "Aced: Microsoft SWE interview guide",
  url: "https://www.aced.io/guides/microsoft-software-engineer-interview",
  kind: "prep-guide",
};
const gfgMs: ReportSource = {
  label: "GeeksforGeeks: Microsoft SDE-I (1+ yr) experience",
  url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-i-1-year-experienced/",
  kind: "candidate-report",
  year: 2025,
};

const appleCareers: ReportSource = {
  label: "Apple Careers (US)",
  url: "https://www.apple.com/careers/us/",
  kind: "official",
};
const drillApple: ReportSource = {
  label: "DrillInsight: Apple interview experience",
  url: "https://www.drillinsight.com/news/apple-interview-experience/",
  kind: "candidate-report",
  year: 2025,
};
const techscreenApple: ReportSource = {
  label: "TechScreen: Apple interview process 2026",
  url: "https://techscreen.app/articles/apple-technical-interview-process-2026",
  kind: "prep-guide",
  year: 2026,
};
const taroApple: ReportSource = {
  label: "Taro: Apple software engineer experience (San Francisco)",
  url: "https://www.jointaro.com/interviews/companies/apple/experiences/software-engineer-san-francisco-ca-may-19-2025-declined-offer-positive-03458ea9/",
  kind: "candidate-report",
  year: 2025,
};

const metaCulture: ReportSource = {
  label: "Meta Careers: Culture",
  url: "https://www.metacareers.com/culture",
  kind: "official",
};
const devMeta: ReportSource = {
  label: "DEV: Meta E4 interview experience (rejected)",
  url: "https://dev.to/oa_vo_support/meta-e4-software-engineer-interview-experience-i-was-rejected-45bm",
  kind: "candidate-report",
  year: 2025,
};
const roundzMeta: ReportSource = {
  label: "Roundz: Meta SDE-1 (E3) experience, London",
  url: "https://roundz.substack.com/p/interview-experience-meta-sde1-e3",
  kind: "candidate-report",
  year: 2025,
};
const helloMeta: ReportSource = {
  label: "Hello Interview: Meta E4 guide",
  url: "https://www.hellointerview.com/guides/meta/e4",
  kind: "prep-guide",
};

const amazonLp: ReportSource = {
  label: "Amazon: Leadership Principles",
  url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles",
  kind: "official",
};
const gfgAmazon: ReportSource = {
  label: "GeeksforGeeks: Amazon SDE-1 interview experience",
  url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-14/",
  kind: "candidate-report",
};
const roundzAmazon: ReportSource = {
  label: "Roundz: Amazon SDE-2 (L5) experience",
  url: "https://roundz.substack.com/p/interview-experience-82-amazon-sde2",
  kind: "candidate-report",
};
const helloAmazonL4: ReportSource = {
  label: "Hello Interview: Amazon L4 (SDE I) guide",
  url: "https://www.hellointerview.com/guides/amazon/l4",
  kind: "prep-guide",
};
const helloAmazonL5: ReportSource = {
  label: "Hello Interview: Amazon L5 (SDE II) guide",
  url: "https://www.hellointerview.com/guides/amazon/l5",
  kind: "prep-guide",
};

const netflixCulture: ReportSource = {
  label: "Netflix Jobs: Culture",
  url: "https://jobs.netflix.com/culture",
  kind: "official",
};
const acedNetflix: ReportSource = {
  label: "Aced: Netflix SWE interview guide",
  url: "https://www.aced.io/guides/netflix-software-engineer-interview",
  kind: "prep-guide",
};
const prepfullyNetflix: ReportSource = {
  label: "Prepfully: Netflix software engineer guide",
  url: "https://prepfully.com/interview-guides/netflix-software-engineer",
  kind: "prep-guide",
};
const taroNetflix: ReportSource = {
  label: "Taro: Netflix software engineer experience (New York)",
  url: "https://www.jointaro.com/interviews/companies/netflix/experiences/software-engineer-new-york-ny-may-18-2025-accepted-offer-positive-5be31adb/",
  kind: "candidate-report",
  year: 2025,
};
const prachubNetflix: ReportSource = {
  label: "PracHub: Netflix senior SWE, ads org onsite",
  url: "https://prachub.com/interview-experiences/netflix-senior-software-engineer-interview-experience-onsite-loop-in-the-ads-org-topo-sort-system-design-and-two-bqs",
  kind: "candidate-report",
  year: 2026,
};

const uberNorms: ReportSource = {
  label: "Uber: Cultural norms (November 2017 post)",
  url: "https://www.uber.com/newsroom/ubers-new-cultural-norms",
  kind: "official",
  year: 2017,
};
const taroUberSde2: ReportSource = {
  label: "Taro: Uber SDE II (Bengaluru), Feb 2025",
  url: "https://www.jointaro.com/interviews/companies/uber/experiences/software-engineer-ii-bengaluru-february-1-2025-no-offer-neutral-52af2520/",
  kind: "candidate-report",
  year: 2025,
};
const taroUberSenior: ReportSource = {
  label: "Taro: Uber senior SWE (Bengaluru), Oct 2024",
  url: "https://www.jointaro.com/interviews/companies/uber/experiences/senior-software-engineer-bengaluru-october-1-2024-accepted-offer-positive-dd2ed38b/",
  kind: "candidate-report",
  year: 2024,
};
const ioUber: ReportSource = {
  label: "interviewing.io: Uber interview process and questions",
  url: "https://interviewing.io/uber-interview-questions",
  kind: "prep-guide",
};
const techprepUber: ReportSource = {
  label: "TechPrep: Uber interview process",
  url: "https://www.techprep.app/blog/uber-interview-process",
  kind: "prep-guide",
};

const atlassianValues: ReportSource = {
  label: "Atlassian: Company values",
  url: "https://www.atlassian.com/company/values",
  kind: "official",
};
const atlassianInterviewing: ReportSource = {
  label: "Atlassian: Engineering interviewing",
  url: "https://www.atlassian.com/company/careers/resources/interviewing/engineering",
  kind: "official",
};
const taroAtlassianIntern: ReportSource = {
  label: "Taro: Atlassian page with values interview snippets (Dec 2024)",
  url: "https://www.jointaro.com/interviews/companies/atlassian/work-experiences/software-engineer-intern-gdansk-april-14-2025-5-f5453aa1/",
  kind: "candidate-report",
  year: 2024,
};
const techprepAtlassian: ReportSource = {
  label: "TechPrep: Atlassian interview process",
  url: "https://www.techprep.app/blog/atlassian-interview-process",
  kind: "prep-guide",
};

export const people: PeopleSet[] = [
  {
    company: "google",
    valuesSource: googlePhilosophy,
    values: [
      {
        name: "Focus on the user and all else will follow",
        line: "Design around what the person using the product needs rather than internal goals, and keep ads separate from rankings.",
      },
      {
        name: "It's best to do one thing really, really well",
        line: "Go deep on a core strength, then carry what you learn into neighbouring products.",
      },
      {
        name: "Fast is better than slow",
        line: "Speed counts as a real improvement, so lean pages and efficient systems that answer quickly are worth the effort.",
      },
      {
        name: "Democracy on the web works",
        line: "Use the collective signal of many people, such as links, and back open source rather than a single authority.",
      },
      {
        name: "You don't need to be at your desk to need an answer",
        line: "Make information reachable wherever people are, which is why mobile services and open platforms matter.",
      },
      {
        name: "You can make money without doing evil",
        line: "Earn revenue while keeping ads relevant and clearly labelled, and never let payment influence rankings.",
      },
      {
        name: "There's always more information out there",
        line: "Look past the obvious data toward other formats and sources, such as books, patents and news archives.",
      },
      {
        name: "The need for information crosses all borders",
        line: "Make information accessible worldwide, including through many languages and translation tools.",
      },
      {
        name: "You can be serious without a suit",
        line: "A casual, creative atmosphere can sit alongside demanding work, and ideas are tested quickly.",
      },
      {
        name: "Great just isn't good enough",
        line: "Treat great as the starting point and work out the need users have not yet voiced.",
      },
    ],
    themes: [
      "Collaboration and disagreement",
      "Comfort with ambiguity",
      "Valuing feedback",
      "User-first thinking",
      "Learning from failure",
      "Mentoring",
      "Deciding with incomplete information",
    ],
    questions: [
      {
        id: "google-disagree",
        q: "Tell me about a disagreement with a colleague and how it ended.",
        why: "Reported as a Googleyness-style prompt. The listener checks whether you can hold a position, use evidence, and still leave the other person willing to work with you.",
        frame:
          'Pick a disagreement about a technical or product choice, not a personality clash. Say what each side wanted, what data or experiment settled it, and what you changed in how you work together afterwards. Opening to adapt: "On [project], [colleague] and I disagreed about [choice], so we agreed to test it by [method]."',
        book: { round: "r11", qid: "r11-1" },
        grade: "several",
        sources: [gfgGoogle, acedGoogle],
      },
      {
        id: "google-incomplete-info",
        q: "Describe a decision you had to make before you had all the information.",
        why: "Checks comfort with ambiguity and whether you can move without waiting for certainty, while still limiting the cost of being wrong.",
        frame:
          'State what was missing, what you did to shrink the gap quickly, the assumption you wrote down, and how you would have noticed if it was wrong. Close with the outcome and what you would repeat. Opening to adapt: "We had to choose [option] before [data] was available, so I picked the choice that was easiest to reverse."',
        grade: "one",
        sources: [gfgGoogle],
      },
      {
        id: "google-mentoring",
        q: "How have you helped a more junior engineer grow?",
        why: "Looks for evidence that you raise the people around you rather than only your own output, which matters for collaboration and level.",
        frame:
          'Describe the gap you saw, what you did that was specific (pairing, review comments, a stretch task with a safety net), and the visible change in their work. Avoid framing it as rescuing them. Opening to adapt: "A newer teammate on [team] was struggling with [skill], so I started by [action]."',
        grade: "one",
        sources: [gfgGoogle],
      },
      {
        id: "google-ambiguity",
        q: "Tell me about a time the goal was unclear and you still had to make progress.",
        why: "A guide lists ambiguity as a theme. The listener checks whether you create structure, ask the right questions, and avoid stalling.",
        frame:
          'Show how you turned a vague goal into a first milestone: who you asked, what you proposed, and how you confirmed direction early. Mention what you dropped. Opening to adapt: "The request was [vague goal], so my first step was to write down what success would look like and check it with [stakeholder]."',
        grade: "guide",
        sources: [acedGoogle],
      },
      {
        id: "google-user-first",
        q: "Tell me about a time you put the user ahead of other goals.",
        why: "Ties to the focus-on-the-user idea on the company philosophy page. The listener wants to see that you can name a real user need and trade something off to protect it.",
        frame:
          'Name the user, the evidence you had about their problem (support tickets, logs, a conversation), and what you gave up or delayed. Say how you knew the result helped. Opening to adapt: "Our metric said [x], but users were hitting [problem], so I argued for [change]."',
        grade: "guide",
        sources: [acedGoogle, googlePhilosophy],
      },
      {
        id: "google-learning",
        q: "What do you do to keep learning, and what did you learn from a recent mistake?",
        why: "Checks the learning mindset and self-awareness about failure that guides list, and whether you can describe a mistake without blaming others.",
        frame:
          'Give one concrete habit and one specific mistake: what you misjudged, what you changed in your process, and where the change has since helped. Keep the tone plain, not performative. Opening to adapt: "My most useful recent lesson was on [topic], where I got [thing] wrong because [reason]."',
        grade: "guide",
        sources: [acedGoogle],
      },
      {
        id: "google-hypothetical",
        q: "A teammate keeps missing review deadlines and it is blocking you. What would you do?",
        why: 'A guide reports that hypothetical "how would you handle this" questions appear beside past-experience ones. The listener checks your default approach to friction.',
        frame:
          'Describe the order of your steps: understand their constraints privately first, agree a small change, involve the lead only if it persists. Then link to a real time you used the same approach. Opening to adapt: "I would start by asking what is getting in their way, and I have done this before on [project]."',
        grade: "guide",
        sources: [helloGoogle],
      },
    ],
    offer: [
      "A guide reports that the recruiter screen is where work authorisation, salary expectations and timeline are checked.",
      "A guide says coding performance often decides whether you land at L4 or are down-levelled to L3. Two guides disagree on whether team matching comes before or after the hiring committee, so ask the recruiter how it works for your case.",
      "One January 2025 Bangalore SDE-2 candidate reports an offer about two weeks after the final round.",
      "General advice: ask for the base, bonus and equity breakdown in writing, ask which level the offer is at, and avoid naming a figure before they do if the recruiter lets you.",
    ],
    gaps: "The page used for values is the company philosophy page, not a hiring-values page, so the ten headings are principles of the business rather than interview criteria. Google's own careers pages describing the behavioural round did not load as readable text, and only one short first-hand account was found.",
  },
  {
    company: "microsoft",
    valuesSource: msValues,
    values: [
      {
        name: "Respect",
        line: "Give other people's views, feelings and backgrounds the same weight as your own.",
      },
      { name: "Integrity", line: "Be honest and trustworthy, including when the truth is awkward to say." },
      {
        name: "Accountability",
        line: "Own your decisions and their results instead of pointing at someone else.",
      },
    ],
    themes: [
      "Strengths and weaknesses",
      "Failure and lessons",
      "Conflict with colleagues",
      "Past project depth",
      "Collaboration across teams",
      "Adapting to changing priorities",
      "Growth mindset",
      "Ownership without blaming others",
    ],
    questions: [
      {
        id: "microsoft-why-leave",
        q: "Why are you looking to leave your current company?",
        why: "A guide reports this as a standard prompt. The listener checks that your reasons point forward, and that you do not speak badly of your employer, which tests integrity and respect.",
        frame:
          'Give one pull toward the role and one honest push away, stated neutrally. Keep the push about scope or growth, not people. Opening to adapt: "I have learned a lot on [area], and I am looking for [specific thing] that this role offers."',
        grade: "guide",
        sources: [helloMs],
      },
      {
        id: "microsoft-conflict",
        q: "Tell me about a difficult working relationship and how you handled it.",
        why: "Guides list conflict with colleagues and a hardest-challenge story. The listener checks respect, whether you stayed professional, and whether the work still shipped.",
        frame:
          'Describe the friction in terms of the work (a decision, a deadline), what you did to understand the other view, and what changed. Avoid casting the other person as the villain. Opening to adapt: "[Colleague] and I saw [decision] differently, so I asked them to walk me through their constraints."',
        grade: "guide",
        sources: [helloMs, ioMs],
      },
      {
        id: "microsoft-failure",
        q: "What is a mistake you made that taught you something, and what did you change afterwards?",
        why: "Guides list failure and lessons learned, and one stresses ownership without blame. This is where accountability is checked.",
        frame:
          'Use a real error with a real cost. Say what you did to contain it, what you took responsibility for, and the concrete practice you changed. End on that change, not on the apology. Opening to adapt: "I shipped [change] without [check], and I now do [practice] before any release."',
        book: { round: "r10", qid: "r10-3" },
        grade: "guide",
        sources: [ioMs],
      },
      {
        id: "microsoft-above-beyond",
        q: "Tell me about a time you went beyond your task to make something better.",
        why: "A guide groups going above and beyond with collaboration and initiative. The listener checks initiative and whether the extra effort had a measurable effect.",
        frame:
          'Show what you noticed that nobody had asked you to fix, who you brought in, and the result in numbers if you have them. Make clear you did not neglect your main task. Opening to adapt: "While working on [task] I noticed [problem] and raised it with [team]."',
        grade: "guide",
        sources: [techprepMs],
      },
      {
        id: "microsoft-growth-mindset",
        q: "Give an example of changing your approach after priorities shifted or you received feedback.",
        why: "Growth mindset is named on the hiring-tips page and a guide pairs it with changing priorities. The listener checks whether you adapt without defensiveness.",
        frame:
          'Describe the old approach, the signal that it was no longer right (feedback, a changed deadline), and the specific new habit you adopted. Show the before and after. Opening to adapt: "When [priority] changed, I realised my usual way of [doing x] no longer fit, so I tried [new approach]."',
        grade: "guide",
        sources: [acedMs, msHiringTips],
      },
      {
        id: "microsoft-project-depth",
        q: "Walk me through a past project in depth: your part, the trade-offs, and what you would redo.",
        why: "One candidate reports a hiring-manager round that opened with deep questions on previous work before moving to a design task. The listener checks that you really own what the resume says.",
        frame:
          'Prepare a two-minute map (problem, your scope, key decisions, outcome), then be ready to go two levels deeper on any decision. Separate what you did from what the team did. Opening to adapt: "I owned [component], which handled [load or problem], and the hardest choice was [decision]."',
        book: { round: "r10", qid: "r10-2" },
        grade: "one",
        sources: [gfgMs],
      },
      {
        id: "microsoft-accountability",
        q: "Tell me about a decision of yours that turned out wrong and who you told.",
        why: "Tied to the accountability and integrity values on the corporate values page. The listener checks how quickly you surface bad news and whether you own it.",
        frame:
          'Say when you realised, who you told first, what you proposed to fix it, and what you did to stop it recurring. Keep the focus on speed and honesty. Opening to adapt: "Two days after release I saw [signal] that my call was wrong, and I told [person] the same day."',
        grade: "guide",
        sources: [msValues, ioMs],
      },
    ],
    offer: [
      "Microsoft's hiring-tips page says the recruiter sends offer documents to review and sign, and encourages you to weigh the whole rewards package (incentive pay, medical cover, retirement contributions, wellness programmes and office amenities) rather than base pay alone.",
      "One SDE-I candidate reports phoning HR about two days after the final round and being told they were selected.",
      "A guide describes the optional as-appropriate round as a positive sign rather than a behavioural interview.",
      "General advice: ask for the full breakdown and the level in writing, check your notice period and any buy-out terms before agreeing a start date, and ask how the level maps to pay bands.",
    ],
    gaps: "Microsoft's own pages do not describe the interview rounds, and the corporate values page lists respect, integrity and accountability only, with growth mindset appearing on the hiring-tips page instead. Only one first-hand behavioural account was found, and no India-specific HR or notice-period report.",
  },
  {
    company: "apple",
    valuesSource: appleCareers,
    values: [
      { name: "Accessibility", line: "Build features so they fit the way different people naturally use them." },
      { name: "Education", line: "Support students and educators in learning and creating with the products." },
      { name: "Environment", line: "Work toward the stated 2030 goal of net-zero across the carbon footprint." },
      {
        name: "Inclusion and Diversity",
        line: "Take responsibility for a workplace where everyone can belong and contribute.",
      },
      { name: "Privacy", line: "Design products so that user data stays safe and secure." },
      { name: "Racial Equity and Justice", line: "Widen opportunity as part of working against systemic racism." },
      {
        name: "Supply Chain Innovation",
        line: "Hold high standards that protect people and the planet in the supply chain.",
      },
    ],
    themes: [
      "Conflict on a project",
      "Quality under tight deadlines",
      "Craftsmanship",
      "Ownership",
      "Disagreement with cross-functional partners",
      "Team and personality fit",
      "Product taste",
      "Confidentiality about your current employer",
    ],
    questions: [
      {
        id: "apple-conflict",
        q: "Describe a conflict on a project and how you worked through it.",
        why: "Reported in a 2025 candidate account. The listener checks how you handle friction on a team that works closely across functions.",
        frame:
          'Pick a conflict about the work, such as scope, design or timing. State both positions fairly, what you did to find common ground, and the working agreement you ended with. Opening to adapt: "On [project], design and engineering disagreed about [scope], and I suggested we [step]."',
        grade: "one",
        sources: [drillApple],
      },
      {
        id: "apple-quality-deadline",
        q: "How do you keep quality high when the deadline is tight?",
        why: "Reported in a 2025 candidate account. The listener checks that you do not quietly lower the bar, and that you can say what you cut and what you protected.",
        frame:
          'Explain how you decide what is non-negotiable (correctness, accessibility, privacy), what you cut or defer, and how you told stakeholders. Give one concrete example of scope you removed. Opening to adapt: "With [days] left on [feature], I protected [critical path] and moved [nice-to-have] to the next release."',
        grade: "one",
        sources: [drillApple],
      },
      {
        id: "apple-products",
        q: "Which Apple products do you use, and what would you change about one of them?",
        why: "A guide reports product taste as a theme. The listener checks that you have used the products closely and can critique with a reason rather than a complaint.",
        frame:
          'Choose one product you actually use daily. Describe a specific friction, who it affects, and a change with a trade-off you can name (battery, privacy, complexity). Opening to adapt: "On [product], I notice [friction] when [situation], and a fix would cost [trade-off]."',
        grade: "guide",
        sources: [techscreenApple],
      },
      {
        id: "apple-cross-functional",
        q: "Tell me about disagreeing with a design, product or other partner and what you did.",
        why: "A guide lists collaboration and healthy disagreement as recurring themes. The listener checks that you argue from the user and the evidence, then commit once it is decided.",
        frame:
          'Show how you understood the partner\'s goal first, what evidence you brought, and how the decision was made. If you lost the argument, show that you still delivered well. Opening to adapt: "Our designer wanted [x] and I was worried about [y], so I built a quick prototype to compare."',
        grade: "guide",
        sources: [techscreenApple],
      },
      {
        id: "apple-craft",
        q: "Tell me about a detail in your work that others would have skipped, and why you cared.",
        why: "Guides name craftsmanship and ownership. The listener checks whether you take responsibility for the finish of a feature, not only that it works.",
        frame:
          'Pick a detail that affected users or maintainers (an edge case, an animation, an error message). Say how you found it, what it cost, and what difference it made. Opening to adapt: "The feature passed review, but I noticed [detail] and spent [time] fixing it because [reason]."',
        grade: "guide",
        sources: [techscreenApple],
      },
      {
        id: "apple-privacy",
        q: "How have you protected user data or privacy in something you built?",
        why: "Privacy is a stated commitment on the careers page, and a guide says interviewers care about it in design rounds. The listener checks that you treat it as a design constraint and can give specific practices.",
        frame:
          'Describe one concrete choice, such as collecting less, keeping data on the device, or limiting access, and the cost it carried. Avoid sharing anything confidential about a current employer; describe the pattern, not the product details. Opening to adapt: "In [kind of system], I decided not to store [data] because [reason]."',
        grade: "guide",
        sources: [appleCareers, techscreenApple],
      },
      {
        id: "apple-team-fit",
        q: "What kind of team environment do you do your best work in?",
        why: "One 2025 candidate felt the process leaned on personality and fit, and a guide presents behavioural interviews as an important part of the loop. The listener checks self-awareness and realism.",
        frame:
          'Name two or three conditions that help you (clear ownership, close design contact, high standards for review) with a brief example of each, and one thing you adapt to. Avoid generic phrases. Opening to adapt: "I do my best work when [condition], for example on [project]."',
        grade: "one",
        sources: [taroApple],
      },
    ],
    offer: [
      "One guide describes the sign-on bonus as the most negotiable element and base salary as less flexible, with level and the RSU grant movable, especially with a competing offer.",
      "The same guide says behavioural interviews are one or two of the four to eight onsite interviews and that domain depth is the deciding factor, so treat the behavioural round as important but not the whole loop.",
      "General advice: ask for the breakdown of base, RSUs and sign-on in writing, ask how the vesting schedule works, and confirm your notice period and any buy-out before agreeing a start date.",
    ],
    gaps: "Apple publishes no interview description, and the listed values are company-wide commitments rather than behavioural criteria. The first-hand evidence is a 2025 account on a coaching company's site that cannot be independently verified and a short Taro snippet, and no India-specific HR or notice-period report was found.",
  },
  {
    company: "meta",
    valuesSource: metaCulture,
    values: [
      { name: "Move fast", line: "Act with urgency and remove blockers so everyone is moving in one direction." },
      {
        name: "Build awesome things",
        line: "Aim for work that inspires people rather than work that is merely adequate.",
      },
      {
        name: "Be direct and respect your colleagues",
        line: "Speak candidly and have tough conversations while staying respectful when you give feedback.",
      },
      {
        name: "Focus on long-term impact",
        line: "Choose hard, lasting problems over quick wins, even when results take years.",
      },
      {
        name: "Live in the future",
        line: "Shape how people will work, with an in-person focus, and adopt new products early.",
      },
      {
        name: "Meta, Metamates, me",
        line: "Take responsibility for the company's success and look after your teammates.",
      },
    ],
    themes: [
      "Resolving conflicts",
      "Driving results",
      "Embracing ambiguity",
      "Growing continuously",
      "Communicating effectively",
      "Initiative beyond the brief",
      "Negative feedback",
      "Scope of impact decides level",
    ],
    questions: [
      {
        id: "meta-disagree",
        q: "Tell me about a time you disagreed with a colleague at work and how it ended.",
        why: "Reported by a candidate and a guide. The listener checks directness with respect, which matches the culture page, and whether you move the group forward.",
        frame:
          'State your concern with its evidence, how you raised it (in the open, with the person first), and how the team decided. Show the outcome even if you were wrong. Opening to adapt: "I thought [approach] would cause [problem], so I wrote up the trade-offs and we reviewed them together."',
        book: { round: "r11", qid: "r11-1" },
        grade: "several",
        sources: [devMeta, helloMeta],
      },
      {
        id: "meta-challenging-person",
        q: "Describe working with someone you found difficult.",
        why: "Reported by an E3 London candidate. The listener checks emotional maturity and whether you adjusted your own approach rather than just endured them.",
        frame:
          'Describe the specific behaviour that blocked the work, not a label for the person. Say what you tried (a direct conversation, changing a process), and the result. Keep it fair to them. Opening to adapt: "[Colleague] often [behaviour] in reviews, so I asked for a short chat about how we could work better."',
        grade: "one",
        sources: [roundzMeta],
      },
      {
        id: "meta-negative-feedback",
        q: "What is the most difficult feedback you have received, and what did you do with it?",
        why: "Reported by an E3 London candidate. The listener checks whether you take feedback without defensiveness and show growth that is visible afterwards.",
        frame:
          'Quote the substance of the feedback, say how you first reacted honestly, then the specific change you made and any sign that it worked. Opening to adapt: "My lead told me [feedback], which stung, and over the next month I changed [habit]."',
        grade: "one",
        sources: [roundzMeta],
      },
      {
        id: "meta-little-time",
        q: "Tell me about a time you had very little time to finish something important.",
        why: "Reported by an E3 London candidate. The listener checks prioritisation and execution speed, matching the move-fast value, and whether you communicated the trade-offs.",
        frame:
          'Say what the deadline was, what you cut and what you refused to cut, how you updated others, and what shipped. Include what you would do differently with more warning. Opening to adapt: "We had [short time] to deliver [thing], so I split it into [parts] and shipped the critical one first."',
        grade: "one",
        sources: [roundzMeta],
      },
      {
        id: "meta-beyond-brief",
        q: "Give an example of exceeding what a task required.",
        why: "Reported by an E4 candidate. The listener checks initiative and scope, which a guide says drive the level signal.",
        frame:
          'Describe what the task asked for, what you saw that was bigger, and how you widened the scope without losing the original delivery. State the measurable effect. Opening to adapt: "The ticket asked for [narrow thing], but I saw that [bigger problem], so I also [action]."',
        grade: "several",
        sources: [devMeta, helloMeta],
      },
      {
        id: "meta-adopted-suggestion",
        q: "Tell me about a time other people adopted an idea of yours.",
        why: "Reported by an E4 candidate. The listener checks influence: how you persuaded people who did not have to follow you, and whether you measured the result.",
        frame:
          'Explain the idea, who needed convincing, what you showed them (a prototype, numbers), and what happened after adoption. Credit others where due. Opening to adapt: "I proposed [idea] to [group] by showing [evidence], and it was adopted for [scope]."',
        grade: "one",
        sources: [devMeta],
      },
      {
        id: "meta-unclear-requirements",
        q: "Tell me about a project with unclear or changing requirements.",
        why: "A guide lists this with follow-ups on how you convinced the team and measured impact. The listener checks comfort with ambiguity and the scale of what you handled.",
        frame:
          'Describe how you pinned down what could be known, what you built first, how you communicated changes, and how you measured success. Expect follow-ups on numbers. Opening to adapt: "The requirements for [project] kept shifting, so I fixed [part] early and kept [part] flexible."',
        grade: "guide",
        sources: [helloMeta],
      },
      {
        id: "meta-long-term",
        q: "Tell me about a time you chose a harder, longer-term fix over a quick win.",
        why: "Ties to the long-term impact value on the culture page. The listener checks judgement and whether you can justify patience with evidence.",
        frame:
          'Describe the quick option and its recurring cost, the longer-term option, and how you persuaded others to wait. State the eventual result honestly, including any delay it caused. Opening to adapt: "We could patch [problem] in a day, but it kept costing [time], so I proposed [lasting fix]."',
        grade: "guide",
        sources: [metaCulture],
      },
    ],
    offer: [
      "A guide says the behavioural round heavily influences level, and that weak behavioural or design performance can mean being offered E3 instead of E4, or a rejection.",
      "A guide says Meta changed its process in 2023, so informal team conversations now happen before offers instead of the older bootcamp, and that matching can stretch the timeline if no team has an opening.",
      "The same guide says offer negotiation comes after team matching. No first-hand compensation account was found.",
      "General advice: ask which level is being offered and why, get the full breakdown in writing, and check notice period and buy-out before agreeing a date.",
    ],
    gaps: "Meta publishes its values but no interview criteria. Both first-hand reports are short, and the competency list and the level and team-matching claims come from a single guide site.",
  },
  {
    company: "amazon",
    valuesSource: amazonLp,
    values: [
      {
        name: "Customer Obsession",
        line: "Start from the customer's need and work backwards; trust matters more than watching competitors.",
      },
      {
        name: "Ownership",
        line: "Act like an owner, favour long-term value, and answer for outcomes beyond your own team.",
      },
      {
        name: "Invent and Simplify",
        line: "Look for new and simpler answers, borrow ideas from outside, and accept being misunderstood for a while.",
      },
      {
        name: "Are Right, A Lot",
        line: "Make sound calls with judgement, seek views that contradict yours, and test your own beliefs.",
      },
      { name: "Learn and Be Curious", line: "Keep growing and follow your curiosity toward new possibilities." },
      {
        name: "Hire and Develop the Best",
        line: "Raise the bar with each hire and promotion, coach others, and help strong people move on.",
      },
      {
        name: "Insist on the Highest Standards",
        line: "Hold demanding standards, keep raising quality, and fix defects at the root.",
      },
      { name: "Think Big", line: "Set a bold direction that inspires people, since thinking small limits the result." },
      {
        name: "Bias for Action",
        line: "Speed matters and many decisions can be reversed, so take calculated risks without exhaustive study.",
      },
      {
        name: "Frugality",
        line: "Do more with less and treat constraints as a prompt for inventiveness, not a case for more budget.",
      },
      {
        name: "Earn Trust",
        line: "Listen, speak candidly, treat people with respect, own your flaws openly, and compare yourself with the best.",
      },
      {
        name: "Dive Deep",
        line: "Stay close to the detail, audit often, and question metrics or stories that disagree; no task is beneath you.",
      },
      {
        name: "Have Backbone; Disagree and Commit",
        line: "Challenge decisions you doubt even when it is uncomfortable, then back the final call fully.",
      },
      {
        name: "Deliver Results",
        line: "Focus on the inputs that drive the business, finish on time with quality, and keep going through setbacks.",
      },
      {
        name: "Strive to be Earth's Best Employer",
        line: "Make the workplace safer, more diverse and more equitable, lead with empathy, and support growth.",
      },
      {
        name: "Success and Scale Bring Broad Responsibility",
        line: "Weigh the wider and second-order effects of a large company's actions and aim to do better.",
      },
    ],
    themes: [
      "Ownership and going beyond the brief",
      "Working under pressure",
      "Missed deadlines and commitments",
      "Unclear or changing requirements",
      "Conflict with a coworker",
      "Failure and how it was handled",
      "Going above and beyond for a customer",
      "Acting against organisational norms",
    ],
    questions: [
      {
        id: "amazon-unclear-requirements",
        q: "Tell me about a time the requirements were unclear or kept changing, and what you did.",
        why: "Reported by a candidate (as an unclear requirement) and two guides (as changing requirements). It tests Bias for Action and Are Right, A Lot: whether you can decide and move with partial information, and learn from how it turned out.",
        frame:
          'Use the situation, task, action, result structure, but spend most time on the actions: how you clarified what you could, what you decided without full information, and the result. Say "I" for your own steps. Opening to adapt: "The spec for [project] changed twice, so I wrote down my assumptions and confirmed them with [owner] before building."',
        grade: "several",
        sources: [gfgAmazon, helloAmazonL4, helloAmazonL5],
      },
      {
        id: "amazon-missed-deadline",
        q: "Tell me about a time you missed a deadline or could not meet a commitment.",
        why: "Reported by a candidate, and a guide lists the close prompt of a missed commitment. It tests Deliver Results and Earn Trust: whether you own a miss, say what it cost, and change your approach.",
        frame:
          'Do not invent a save. State the commitment, why you missed it, when you told people, the business impact, and the specific practice you changed. Opening to adapt: "I committed to [date] for [deliverable], and I missed it because [reason], which cost [impact]."',
        grade: "several",
        sources: [gfgAmazon, helloAmazonL5],
      },
      {
        id: "amazon-extraordinary",
        q: "What is something you did for your team that went beyond your role?",
        why: "Reported by an SDE-2 candidate. It tests Ownership: whether you acted on a problem outside your remit and cared about the long-term result, not only your own tasks.",
        frame:
          'Pick a problem nobody owned, explain why you acted, what you did beyond your job description, and what changed for the team afterwards, with a number if possible. Opening to adapt: "Nobody owned [problem] and it was costing [cost], so I took it on by [action]."',
        book: { round: "r11lp", qid: "r11lp-4" },
        grade: "one",
        sources: [roundzAmazon],
      },
      {
        id: "amazon-against-norms",
        q: "Tell me about a time you went against an organisational standard, and why.",
        why: "Reported by an SDE-2 candidate as a Bar Raiser-style probe. It tests Have Backbone, Disagree and Commit and Earn Trust: your judgement on when a rule should bend and how you handled the consequences.",
        frame:
          'Choose a case where you raised the issue openly, had a clear reason (customer impact, a risk), and took responsibility for the result. Avoid stories that look like bypassing safety or ethics. Opening to adapt: "The standard said [rule], but I believed it would harm [customer], so I escalated to [person] and proposed an exception."',
        grade: "one",
        sources: [roundzAmazon],
      },
      {
        id: "amazon-coworker-conflict",
        q: "Describe a conflict with a coworker and how you resolved it.",
        why: "Two guides list it. It tests Earn Trust and Have Backbone: whether you can be candid and respectful and keep the relationship working after the disagreement.",
        frame:
          'Describe the actual disagreement about the work, what you said directly to the person, what you changed in your own behaviour, and where you both ended up. Opening to adapt: "[Colleague] and I disagreed about [decision], so I asked to talk it through and brought [data]."',
        book: { round: "r11lp", qid: "r11lp-5" },
        grade: "guide",
        sources: [helloAmazonL4, helloAmazonL5],
      },
      {
        id: "amazon-dig-root-cause",
        q: "Tell me about a time you dug deep to find the real cause of a problem.",
        why: "A guide lists a root-cause question. It tests Dive Deep and Insist on the Highest Standards: whether you went past symptoms, checked the data, and fixed the cause.",
        frame:
          'Give the symptom, the first wrong theory, how you narrowed it (logs, metrics, reproduction), the cause, and the fix plus a check that it stays fixed. Include numbers. Opening to adapt: "The alert said [symptom], and the obvious fix did not hold, so I traced [metric] back to [cause]."',
        book: { round: "r11lp", qid: "r11lp-6" },
        grade: "guide",
        sources: [helloAmazonL5],
      },
      {
        id: "amazon-customer",
        q: "Tell me about a time you went out of your way for a customer.",
        why: "A guide lists it, and Customer Obsession is the first principle. The listener checks whether you start from the customer's real need, even at some cost to your own plan.",
        frame:
          'Name the customer (internal or external) and their actual problem, what you did that was not required, and how you knew they were better off. Avoid describing only a favour. Opening to adapt: "A customer was blocked on [problem] and the process would have taken [time], so I [action]."',
        grade: "guide",
        sources: [helloAmazonL4, amazonLp],
      },
      {
        id: "amazon-failure",
        q: "Tell me about a failure and how you handled it.",
        why: "A guide lists it. It tests Ownership and Learn and Be Curious: whether you take the blame, repair the damage, and change something lasting.",
        frame:
          'Give a real failure with real consequences. Say what you owned, how you limited the damage, what you learned, and the mechanism you added so it cannot repeat. Opening to adapt: "I made the call to [action], and it failed because [reason], so I [recovery]."',
        book: { round: "r11lp", qid: "r11lp-7" },
        grade: "guide",
        sources: [helloAmazonL4],
      },
    ],
    offer: [
      "Two guides describe the Bar Raiser, an interviewer from outside the hiring team, as able to veto a hire even when other interviewers back you, so the behavioural stories carry real weight.",
      "One guide says most candidates finish the earlier steps in three to six weeks and that team matching after the loop can extend the total to about eight weeks; another gives four to eight weeks from first contact to offer.",
      "General advice: ask which level is being offered, get the base, sign-on and stock breakdown in writing, and check your notice period and any buy-out before agreeing a start date.",
    ],
    gaps: "Amazon's own page does not map principles to rounds or give round counts. Most principle-level prompts come from guide lists rather than first-hand reports, the two first-hand reports are undated beyond their posting dates, and no compensation, India-specific HR or notice-period report was found.",
  },
  {
    company: "netflix",
    valuesSource: netflixCulture,
    values: [
      {
        name: "The Dream Team",
        line: "Hire high performers who also work well together, in the way a sports team does rather than a family.",
      },
      {
        name: "People Over Process",
        line: "Give people context and freedom to decide, and keep rules and process to a minimum.",
      },
      { name: "Uncomfortably Exciting", line: "Be bold and experimental, even when it feels uncomfortable." },
      {
        name: "Great and Always Better",
        line: "Keep improving the culture and the company rather than settling where they are.",
      },
      { name: "Selflessness", line: "Put the company's interest first and help colleagues succeed." },
      { name: "Judgment", line: "Favour long-term solutions and decide soundly despite ambiguity." },
      { name: "Candor", line: "Give and receive feedback openly and admit mistakes." },
      { name: "Courage", line: "Take risks and challenge the status quo when you think it is wrong." },
      { name: "Curiosity", line: "Learn eagerly and value other people's ideas." },
      { name: "Resilience", line: "Adapt quickly, decide without delay, and take on hard challenges." },
    ],
    themes: [
      "Reaction to the culture memo",
      "Giving and receiving feedback",
      "Why this role",
      "Match with the team's domain",
      "Stress and delivery",
      "Saying no to a stakeholder",
    ],
    questions: [
      {
        id: "netflix-culture-memo",
        q: "Which ideas in the culture document stood out to you, and which did not resonate?",
        why: "Reported by two guides and a 2025 candidate. The listener checks that you read the memo closely and can disagree honestly, which fits the candor value.",
        frame:
          'Choose one or two ideas, link each to a real moment from your work, and say one you are less sure about and why. Honest doubt is stronger than flattery. Opening to adapt: "The idea that [principle] matched my experience on [project], while [other idea] raises a question for me."',
        grade: "several",
        sources: [acedNetflix, prepfullyNetflix, taroNetflix],
      },
      {
        id: "netflix-feedback",
        q: "Tell me about a time you gave someone difficult feedback.",
        why: "A guide lists it as a follow-up to the principle you cited. It tests candor: whether you speak plainly and kindly and whether the other person could use it.",
        frame:
          'Describe the behaviour, what you said, how you chose the moment, how they responded, and what changed. Add a time you received feedback in return if you can. Opening to adapt: "I noticed [behaviour] affecting [outcome], so I told [person] directly and offered to help."',
        grade: "guide",
        sources: [acedNetflix],
      },
      {
        id: "netflix-why-role",
        q: "What are you looking for in your next role, and which parts of this job description appeal to you?",
        why: "A guide says candidates report being asked what appeals about the job description, and a 2026 senior candidate says two behavioural rounds with managers tested whether their experience matched it. The listener checks that your motivation is specific to the work.",
        frame:
          'Name two responsibilities from the job description, tie each to something you have done, and say what you want to learn that you cannot where you are. Opening to adapt: "The part about [responsibility] fits my work on [project], and I want more of [kind of problem]."',
        book: { round: "r11", qid: "r11-3" },
        grade: "several",
        sources: [acedNetflix, prachubNetflix],
      },
      {
        id: "netflix-stress-lead",
        q: "How do you handle extreme stress, and how would you keep a team on time?",
        why: "A guide reports stress, leadership and delivery questions. The listener checks resilience and whether your approach to pressure helps other people.",
        frame:
          'Describe your concrete habits under pressure (triage, daily check-ins, saying what is at risk early) and one example where they worked. Keep it honest about what is hard for you. Opening to adapt: "When [deadline] looked at risk, I listed what was blocked and told [person] by the next morning."',
        grade: "guide",
        sources: [prepfullyNetflix],
      },
      {
        id: "netflix-say-no",
        q: "Tell me about a time you said no to a client or stakeholder.",
        why: "A guide lists it. The listener checks courage and judgement: whether you can decline with reasons, offer an alternative, and keep the relationship.",
        frame:
          'State the request, why it was wrong or too costly, what you offered instead, and how they responded. Show that you decided with data and judgement, not just opinion. Opening to adapt: "[Stakeholder] asked for [request], and I said no because [reason], then proposed [alternative]."',
        grade: "guide",
        sources: [prepfullyNetflix],
      },
      {
        id: "netflix-judgment",
        q: "Tell me about a decision where the data and your instinct disagreed.",
        why: "Ties to the judgment value on the culture page, which is about sound decisions despite ambiguity. The listener checks how you reason under uncertainty and own the result.",
        frame:
          'Lay out what the data said, what your instinct said, why you chose one, what you did to limit the downside, and how it turned out. Opening to adapt: "The numbers suggested [x], but I judged [y] because [reason], and I set up [check] to find out early."',
        grade: "guide",
        sources: [netflixCulture],
      },
      {
        id: "netflix-own-mistake",
        q: "Describe a mistake you made and how you shared what you learned with others.",
        why: "Ties to the candor value, which includes admitting mistakes. The listener checks whether you surface your own errors openly and let others learn from them.",
        frame:
          'Describe the mistake without softening it, how you told people, and how you passed the lesson on (a write-up, a team talk, a changed checklist). Opening to adapt: "I made an error in [work], and I wrote up what happened for the team in [format]."',
        book: { round: "r10", qid: "r10-3" },
        grade: "guide",
        sources: [netflixCulture],
      },
    ],
    offer: [
      "No first-hand account of the compensation conversation or notice period was found for Netflix, so everything here is general advice rather than a report.",
      "Ask the recruiter for the full breakdown of cash and any equity in writing, and ask which level the role is at and how it is reviewed.",
      "Check your notice period and any buy-out terms before agreeing a start date, and avoid naming a figure first if the recruiter allows it.",
    ],
    gaps: "Netflix publishes its culture page but no interview process, and no first-hand compensation or notice-period account was found. The 2026 account is undated for the interviews themselves and does not list the behavioural questions, and one guide mixes generic prompts with Netflix-specific ones, so loops likely vary by team and level.",
  },
  {
    company: "uber",
    valuesSource: uberNorms,
    values: [
      {
        name: "We build globally, we live locally",
        line: "Use worldwide scale while staying close to local cities, communities, drivers and riders.",
      },
      {
        name: "We are customer obsessed",
        line: "Earn customers' trust by helping them save money or earn more, and accept short-term costs for long-term loyalty.",
      },
      {
        name: "We celebrate differences",
        line: "Make people from all backgrounds welcome and invite varied views before the team commits to a plan.",
      },
      { name: "We do the right thing. Period.", line: "Act ethically without qualification, whatever the pressure." },
      {
        name: "We act like owners",
        line: "Take initiative on problems, support colleagues, act decisively and take responsibility for errors.",
      },
      {
        name: "We persevere",
        line: "Take on hard challenges rather than easy paths, and treat resilience as a core strength.",
      },
      {
        name: "We value ideas over hierarchy",
        line: "Good ideas can come from anyone; test them through open debate and then act.",
      },
      {
        name: "We make big bold bets",
        line: "Accept that some bets fail, learn from them, and keep moving forward.",
      },
    ],
    themes: [
      "Working on a team",
      "Dealing with failure",
      "Leadership",
      "Past project delivery and impact",
      "Domain expertise and confidence",
      "Ownership with numbers",
    ],
    questions: [
      {
        id: "uber-project-walkthrough",
        q: "Walk me through the most significant project you have worked on.",
        why: "A Bengaluru SDE-2 candidate lists a walkthrough of their most significant project, and a guide says the hiring manager walks through past projects. The listener checks depth, ownership and the scope you handled for your level.",
        frame:
          'Prepare a five-minute walkthrough: the problem, your role, the architecture in broad strokes, two trade-offs, and the result with a number. Be ready to go deeper on any piece. Opening to adapt: "I led [component] of [project], which handled [scale], and the key decision was [choice]."',
        book: { round: "r10", qid: "r10-2" },
        grade: "several",
        sources: [taroUberSde2, ioUber],
      },
      {
        id: "uber-delivery-failure",
        q: "How did you deliver a past project, where did it go wrong, and what was the measured impact?",
        why: "A guide lists delivery, failure and quantified impact together. The listener checks honesty about problems and whether you track results with numbers.",
        frame:
          'Give a timeline with milestones, one setback and how you recovered, and the final metric (latency, cost, adoption). Admit what slipped. Opening to adapt: "We planned [milestones], slipped on [one], and ended up with [result] measured by [metric]."',
        grade: "guide",
        sources: [ioUber],
      },
      {
        id: "uber-deep-dive",
        q: "Pick one past project and go into its technical complexity, trade-offs and what failed.",
        why: "One guide describes a Bar Raiser deep dive on a single project, and says the project is a level input. The listener checks that the project's scope matches the level you are targeting.",
        frame:
          'Choose a project at or slightly above your target level. Cover the complexity, alternatives you rejected and why, time to milestones, and one failure. Keep claims separate from your team\'s. Opening to adapt: "The hardest part was [problem], and I weighed [A] against [B] because [reason]."',
        grade: "guide",
        sources: [ioUber],
      },
      {
        id: "uber-domain-management",
        q: "How would you describe your domain depth, and how have you worked with and guided a team?",
        why: "A senior Bengaluru candidate reports the main hiring-manager conversation covering domain expertise, team aspects, management skills and confidence. The listener checks leadership signal.",
        frame:
          'State your core domain in one sentence, then give two examples of guiding others (a design review you led, a person you grew) with outcomes. Speak with calm confidence. Opening to adapt: "My strongest area is [domain], where I have [concrete achievement], and I lead by [method]."',
        grade: "one",
        sources: [taroUberSenior],
      },
      {
        id: "uber-persevere",
        q: "Tell me about pushing through a difficult problem when it would have been easier to stop.",
        why: "A guide stresses ownership, past impact and numbers. This also ties to the Persevere and Act like owners norms. The listener checks grit and sensible judgement about when to push.",
        frame:
          'Describe the obstacle, what you tried that failed, what finally worked, and the measurable result. Show that you asked for help when it was sensible. Opening to adapt: "For weeks [problem] resisted every fix I tried, until I [turning point]."',
        grade: "guide",
        sources: [techprepUber, uberNorms],
      },
      {
        id: "uber-ideas-hierarchy",
        q: "Tell me about a time your idea was challenged by someone more senior, and what happened.",
        why: "Ties to the norm of valuing ideas over hierarchy. The listener checks that you argue on merit, listen, and commit after a decision.",
        frame:
          'Explain your idea and the senior person\'s concern, the evidence you each brought, and the outcome. If you lost, show that you committed and helped it succeed. Opening to adapt: "[Senior person] preferred [approach], so I showed them [data], and we agreed to [decision]."',
        book: { round: "r11lp", qid: "r11lp-5" },
        grade: "guide",
        sources: [uberNorms],
      },
      {
        id: "uber-do-right",
        q: "Tell me about a time doing the right thing cost you time or convenience.",
        why: "Ties to the do-the-right-thing norm. The listener checks integrity under pressure and whether you raise concerns rather than stay silent.",
        frame:
          'Describe the shortcut that was available, why you did not take it, who you told, and what it cost. Keep it factual and avoid moralising. Opening to adapt: "We could have shipped [shortcut], but it risked [harm], so I raised it with [person]."',
        grade: "guide",
        sources: [uberNorms],
      },
    ],
    offer: [
      "A guide reports that the recruiter call covers salary, location and level expectations, and advises against revealing your salary expectations or the state of other processes.",
      "The same guide says the panel decides after the loop, that one strong no-hire can end the process, and that the Bar Raiser project is a leveling input.",
      "A separate guide reports that most candidates hear back within three to five business days of the loop.",
      "General advice: ask which level is being offered, get the full breakdown in writing, and check your notice period and buy-out before agreeing a start date.",
    ],
    gaps: "The values source is a November 2017 post that carries an October 2021 update note pointing to newer values that could not be retrieved, and one guide names different values (Trip Obsessed, Go Get It, Build with Heart), so the list here is likely out of date. The Bar Raiser round comes from one guide that neither first-hand snippet confirms, and Uber's careers site gave no interview description.",
  },
  {
    company: "atlassian",
    valuesSource: atlassianValues,
    values: [
      {
        name: "Open company, no bullshit",
        line: "Share information openly by default, and judge candour by what, when and how you say it.",
      },
      {
        name: "Build with heart and balance",
        line: "Bring passion and urgency, but weigh the options carefully before you commit.",
      },
      {
        name: "Don't #@!% the customer",
        line: "Customers are the lifeblood of the business, so put the perspective of customers as a whole first.",
      },
      {
        name: "Play, as a team",
        line: "Be serious about the work without taking yourselves too seriously, and put what is right for the team first.",
      },
      {
        name: "Be the change you seek",
        line: "Have the courage and resourcefulness to start change; improvement is shared but action is personal.",
      },
    ],
    themes: [
      "An example for each value",
      "Humility and customer empathy",
      "Communication style",
      "Business reasons behind past projects",
      "Growth goals",
    ],
    questions: [
      {
        id: "atlassian-each-value",
        q: "Give a story that shows how you applied each of the five values.",
        why: "Reported by a December 2024 candidate and a guide. The values interview is described as mapping questions to values, so the listener checks for a genuine example of each, not a recited slogan.",
        frame:
          'Prepare two or three short stories per value, each with a situation, your action and a result, and rehearse them so none of them repeats. Say "I" for your own steps. Opening to adapt: "For [value], the clearest example is [situation], where I [action]."',
        grade: "several",
        sources: [taroAtlassianIntern, techprepAtlassian],
      },
      {
        id: "atlassian-business-reason",
        q: "Walk me through a past project, its technical challenges and the business reason behind it.",
        why: "The company's interviewing page describes the manager interview as covering past projects, collaborators, technical challenges and the business justification. The listener checks that you understand why the work mattered.",
        frame:
          'Open with the business problem, then your scope, the hardest technical decision, and the outcome in business terms. Link the technical choice to the goal. Opening to adapt: "The business needed [goal], so my team built [solution], and the hardest part was [challenge]."',
        book: { round: "r10", qid: "r10-2" },
        grade: "guide",
        sources: [atlassianInterviewing],
      },
      {
        id: "atlassian-open-candour",
        q: "Tell me about a time you shared bad news early, or raised something awkward in the open.",
        why: "Ties to the open company value. The listener checks that you are candid with care about what, when and how you say it.",
        frame:
          'Describe the information, why sharing it was uncomfortable, who you told and in what form, and what followed. Show care for the person, not only the facts. Opening to adapt: "I found [problem] two days before [date], so I told [group] straight away with a proposed plan."',
        grade: "guide",
        sources: [atlassianValues, techprepAtlassian],
      },
      {
        id: "atlassian-customer",
        q: "Tell me about a time you protected a customer from a problem, including a cost to you.",
        why: "Ties to the customer value. The listener checks humility and customer empathy, which a guide lists as themes.",
        frame:
          'Name the customer problem, how you learned about it, what you gave up (time, a feature, face), and how the customer was better off. Opening to adapt: "Customers were hitting [issue], so I paused [work] and fixed it first."',
        grade: "guide",
        sources: [atlassianValues, techprepAtlassian],
      },
      {
        id: "atlassian-be-the-change",
        q: "Tell me about a time you started a change nobody had asked you to make.",
        why: "Ties to the be-the-change value. The listener checks initiative and whether you carried the change through with others rather than only proposing it.",
        frame:
          'Describe what you saw wrong, who you brought in, the first small step, and the lasting effect. Show that you handled pushback. Opening to adapt: "Our team kept losing time to [problem], so I proposed and built [fix] with [people]."',
        grade: "guide",
        sources: [atlassianValues, techprepAtlassian],
      },
      {
        id: "atlassian-team-first",
        q: "Tell me about a time you put the team's goal ahead of your own preference or credit.",
        why: "Ties to the play-as-a-team value. The listener checks collaboration and whether you stay light-hearted but serious about outcomes.",
        frame:
          'Say what you wanted, what the team needed, what you did, and the result for the team. Do not make the story about being a martyr. Opening to adapt: "I wanted to build [x], but the team needed [y], so I [action]."',
        grade: "guide",
        sources: [atlassianValues, techprepAtlassian],
      },
      {
        id: "atlassian-balance",
        q: "Tell me about a time you moved fast but stopped to weigh the options before committing.",
        why: "Ties to the build-with-heart-and-balance value. The listener checks that you combine urgency with considered judgement.",
        frame:
          'Describe the pressure to move, the options you compared in a short time, what you chose and why, and how it turned out. Opening to adapt: "We wanted to ship [feature] quickly, but I spent [short time] comparing [options] before we committed."',
        grade: "guide",
        sources: [atlassianValues, techprepAtlassian],
      },
    ],
    offer: [
      "A Hyderabad report from October 2025 lists a final round with HR to discuss salary after two technical rounds.",
      "A guide says feedback goes to a hiring committee before an offer and negotiation discussion, and one December 2024 Mountain View snippet lists a recruiter call and offer after the values interview.",
      "General advice: ask for the breakdown of base, bonus and equity in writing, ask about the level and band, and check your notice period and any buy-out before agreeing a start date.",
    ],
    gaps: "The official values page is undated and the interviewing page gives no durations for the values interview. The first-hand evidence is a December 2024 Mountain View snippet and an October 2025 Hyderabad snippet, both truncated, and level differences were not found.",
  },
];
