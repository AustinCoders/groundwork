import type { CompanyProcess } from "./process-types";

export const PROCESS_MAIN: CompanyProcess[] = [
  {
    company: "google",
    summary:
      "Google runs a recruiter call, one live coding phone screen, a block of 45-minute onsite interviews (mostly algorithms plus a behavioural 'Googleyness' round), then a hiring committee and team matching before any offer. System design shows up from L5 upwards.",
    rounds: [
      {
        name: "Recruiter screen",
        type: "phone",
        format:
          "A non-technical call covering your background, work authorisation, target level, location and team preferences, motivation, salary expectations and timeline. Guides say the recruiter's notes are shared with the interview panel.",
        tested: ["role and level fit", "motivation", "logistics"],
        grade: "guide",
        sources: [
          {
            label: "Aced: Google SWE interview guide",
            url: "https://www.aced.io/guides/google-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Hello Interview: Google L4 guide",
            url: "https://www.hellointerview.com/guides/google/l4",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Nerd Design Lab: Google hiring process",
            url: "https://nerddesignlab.substack.com/p/google-hiring-process-for-general",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 30 min",
      },
      {
        name: "Google Hiring Assessment (GHA)",
        type: "oa",
        format:
          "An online questionnaire of scenario and agree/disagree items about work style. Guides disagree on its length (roughly 50 versus 100 items) and on who takes it. One says failing it blocks reapplying for six months.",
        tested: ["work-style consistency", "judgement in scenarios", "consistency of answers"],
        grade: "guide",
        sources: [
          {
            label: "Aced: Google SWE interview guide",
            url: "https://www.aced.io/guides/google-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Hello Interview: Google L4 guide",
            url: "https://www.hellointerview.com/guides/google/l4",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "30-45 min (one guide)",
        variesBy:
          "One guide calls it mandatory after applying; another says only some candidates get it (referrals and hiring-manager outreach) and that hiring-manager outreach may skip it.",
      },
      {
        name: "Technical phone screen",
        type: "phone",
        format:
          "A live call with an engineer, coding in a shared document with no way to run code. Sources give one problem (the oldest source and a 2025 report) or one to two medium problems (two guides). The oldest source leaves roughly the last five minutes for your questions. The interviewer's rating feeds your packet.",
        tested: ["data structures and algorithms", "coding without an IDE", "explaining your approach aloud"],
        grade: "several",
        sources: [
          {
            label: "Levels.fyi: Google SWE interview process (former recruiter)",
            url: "https://www.levels.fyi/blog/google-software-engineer-interview-process.html",
            kind: "prep-guide",
            year: 2020,
          },
          {
            label: "GeeksforGeeks: Google SDE-2 interview experience (Bangalore)",
            url: "https://www.geeksforgeeks.org/interview-experiences/google-interview-experience-for-software-engineer-sde-2-2025/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Hello Interview: Google L4 guide",
            url: "https://www.hellointerview.com/guides/google/l4",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Aced: Google SWE interview guide",
            url: "https://www.aced.io/guides/google-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45 min in the oldest source and one 2025 report; two 2026 guides say 45-60 min",
        variesBy: "One guide says a second screen is used only if the first is borderline.",
      },
      {
        name: "Onsite coding rounds",
        type: "dsa",
        format:
          "Two to four rounds of algorithm and data-structure problems. Sources disagree on how many problems fit a round: the oldest says usually two per interview, a 2026 guide says typically one challenging one. Trees, graphs, arrays and dynamic programming appear in candidate reports. Some loops are virtual, some in person.",
        tested: [
          "algorithms and data structures",
          "clean working code",
          "handling follow-ups and edge cases",
          "time management",
        ],
        grade: "several",
        sources: [
          {
            label: "GeeksforGeeks: Google SDE-2 interview experience (Bangalore)",
            url: "https://www.geeksforgeeks.org/interview-experiences/google-interview-experience-for-software-engineer-sde-2-2025/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "PracHub: Google SWE experience, four interviews",
            url: "https://prachub.com/interview-experiences/google-software-engineer-interview-experience-four-interviews-across-months-and-unfinished-team-matching",
            kind: "candidate-report",
            year: 2026,
          },
          {
            label: "Levels.fyi: Google SWE interview process (former recruiter)",
            url: "https://www.levels.fyi/blog/google-software-engineer-interview-process.html",
            kind: "prep-guide",
            year: 2020,
          },
          {
            label: "Hello Interview: Google L4 guide",
            url: "https://www.hellointerview.com/guides/google/l4",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45 min each",
        variesBy:
          "L3/L4 loops are coding-heavy; the oldest source says four coding rounds at L3/L4 and three at L5+, while a 2026 guide says two to three onsite coding rounds at L4. One 2026 guide also describes a pilot on select US teams for junior and mid-level roles that adds a code-comprehension round (read and debug existing code, an AI assistant allowed).",
      },
      {
        name: "System design",
        type: "hld",
        format:
          "A design discussion. The one concrete example in the sources is a 2025 candidate asked to design a URL shortener, covering hashing, schema, caching and high read throughput. Sources agree it belongs to the senior (L5 and up) loop.",
        tested: ["scalable design", "trade-off reasoning", "database and caching choices", "communication"],
        grade: "several",
        sources: [
          {
            label: "Levels.fyi: Google SWE interview process (former recruiter)",
            url: "https://www.levels.fyi/blog/google-software-engineer-interview-process.html",
            kind: "prep-guide",
            year: 2020,
          },
          {
            label: "GeeksforGeeks: Google SDE-2 interview experience (Bangalore)",
            url: "https://www.geeksforgeeks.org/interview-experiences/google-interview-experience-for-software-engineer-sde-2-2025/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Hello Interview: Google L4 guide",
            url: "https://www.hellointerview.com/guides/google/l4",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45 min",
        variesBy:
          "Normally from L5 upwards; the oldest source and a 2026 guide say L3/L4 loops have no dedicated design round (another guide says design ideas may surface inside L4 coding rounds), though one 2025 SDE-2 candidate (4 years experience) still got one.",
      },
      {
        name: "Googleyness and leadership",
        type: "behavioral",
        format:
          "Behavioural questions mixing past experiences and hypothetical scenarios. Reports mention disagreeing with colleagues, deciding with incomplete information, mentoring, unclear or changing requirements and going above and beyond.",
        tested: ["collaboration", "comfort with ambiguity", "valuing feedback", "user focus"],
        grade: "several",
        sources: [
          {
            label: "Levels.fyi: Google SWE interview process (former recruiter)",
            url: "https://www.levels.fyi/blog/google-software-engineer-interview-process.html",
            kind: "prep-guide",
            year: 2020,
          },
          {
            label: "GeeksforGeeks: Google SDE-2 interview experience (Bangalore)",
            url: "https://www.geeksforgeeks.org/interview-experiences/google-interview-experience-for-software-engineer-sde-2-2025/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "PracHub: Google SWE experience, four interviews",
            url: "https://prachub.com/interview-experiences/google-software-engineer-interview-experience-four-interviews-across-months-and-unfinished-team-matching",
            kind: "candidate-report",
            year: 2026,
          },
          {
            label: "Hello Interview: Google L4 guide",
            url: "https://www.hellointerview.com/guides/google/l4",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "30-45 min",
        variesBy:
          "One 2026 guide says that at L4 it looks at teamwork and growth potential rather than demonstrated leadership.",
      },
      {
        name: "Hiring committee and team matching",
        type: "manager",
        format:
          "Your interview feedback is bundled into a packet for a committee that makes the hire decision and may offer a lower level. Separately, hiring managers hold fit calls with you. Passing the interviews does not guarantee a team: one 2026 candidate who said they passed was still waiting on team matching months later.",
        tested: ["packet strength across interviews", "mutual fit with a team", "level decision"],
        grade: "several",
        sources: [
          {
            label: "Levels.fyi: Google SWE interview process (former recruiter)",
            url: "https://www.levels.fyi/blog/google-software-engineer-interview-process.html",
            kind: "prep-guide",
            year: 2020,
          },
          {
            label: "PracHub: Google SWE experience, four interviews",
            url: "https://prachub.com/interview-experiences/google-software-engineer-interview-experience-four-interviews-across-months-and-unfinished-team-matching",
            kind: "candidate-report",
            year: 2026,
          },
          {
            label: "Hello Interview: Google L4 guide",
            url: "https://www.hellointerview.com/guides/google/l4",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "fit calls of 30-45 min (oldest source)",
        variesBy:
          "Order varies: some sources say matching comes before the committee, others after; EU offices reportedly match first.",
      },
      {
        name: "Offer",
        type: "hr",
        format:
          "After a team is settled, a recruiter delivers the offer, with compensation set by level and location, and follows up in writing. One 2025 candidate got the decision about two weeks after the final interview.",
        tested: ["compensation negotiation", "level and location pay", "offer timing"],
        grade: "several",
        sources: [
          {
            label: "Levels.fyi: Google SWE interview process (former recruiter)",
            url: "https://www.levels.fyi/blog/google-software-engineer-interview-process.html",
            kind: "prep-guide",
            year: 2020,
          },
          {
            label: "GeeksforGeeks: Google SDE-2 interview experience (Bangalore)",
            url: "https://www.geeksforgeeks.org/interview-experiences/google-interview-experience-for-software-engineer-sde-2-2025/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Nerd Design Lab: Google hiring process",
            url: "https://nerddesignlab.substack.com/p/google-hiring-process-for-general",
            kind: "prep-guide",
            year: 2026,
          },
        ],
      },
    ],
    typicalWeeks:
      "Sources give about 4-8 weeks as typical (the oldest says 4-6, a 2026 guide says 6-8, another about 2 months). Reports range from about 3 weeks to several months, mostly because of team matching; one guide claims three months to over a year.",
    gaps: "Google's own careers pages (how-we-hire, interview-prep) loaded without readable content, so nothing here is official. Candidate reports were few; LeetCode and Glassdoor posts were blocked. Exact GHA length, who takes it, and the committee/team-match order are contested between sources. The code-comprehension pilot comes from a single guide. Per-round durations for onsite are mostly from one old and one new source.",
  },
  {
    company: "meta",
    summary:
      "Meta typically runs an optional online assessment, a recruiter call, a 45-minute coding phone screen, then a roughly four-interview virtual loop of coding, design (mid-level and up) and a heavily weighted behavioural round, followed by team matching. Since late 2025 one coding round may be AI-assisted.",
    rounds: [
      {
        name: "Online assessment (CodeSignal)",
        type: "oa",
        format:
          "A proctored test, usually one multi-stage practical problem whose parts unlock in order, with video and microphone monitoring. Reference tabs for syntax are allowed; AI tools and searching for solutions are not. One guide also reports four separate coding questions instead. One new-grad post labels its assessment technical plus behavioural but describes no behavioural questions.",
        tested: ["practical implementation", "handling added constraints", "performance"],
        grade: "one",
        sources: [
          {
            label: "Hello Interview: Meta E3 guide",
            url: "https://www.hellointerview.com/guides/meta/e3",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Hello Interview: Meta E4 guide",
            url: "https://www.hellointerview.com/guides/meta/e4",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "DEV: Meta new grad three-round experience",
            url: "https://dev.to/oa_vo_support/meta-new-grad-three-round-interview-experience-can-i-get-an-offer-4o6d",
            kind: "candidate-report",
          },
        ],
        duration: "90 min for the staged format; 70 min for the four-question variant (same guide)",
        variesBy:
          "Not everyone gets one; the E3 guide says some candidates report it replacing the technical phone screen.",
      },
      {
        name: "Recruiter screen",
        type: "phone",
        format:
          "A conversation about your background, why Meta, target level and logistics (the E3 guide adds salary expectations). For mid-level and senior roles it is also where you choose a product or infrastructure track, which sets the type of design interview later.",
        tested: ["level fit", "communication", "motivation"],
        grade: "guide",
        sources: [
          {
            label: "Hello Interview: Meta E4 guide",
            url: "https://www.hellointerview.com/guides/meta/e4",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "TechScreen: Meta interview process 2026",
            url: "https://techscreen.app/articles/meta-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "20-30 min",
        variesBy: "Track choice applies to mid-level and senior candidates, the ones who get a design round.",
      },
      {
        name: "Technical phone screen",
        type: "phone",
        format:
          "Live session in a shared editor (CoderPad in two guides) with a Meta engineer. Most candidates get two coding problems, though one guide says one or two. Code execution is disabled, so you trace examples by hand. One guide splits the time as about 5 minutes of introduction, 35 of coding and 5 for your questions.",
        tested: ["problem solving", "coding under a time limit", "self-testing without running code"],
        grade: "several",
        sources: [
          {
            label: "Roundz: Meta SDE-1 (E3) London experience",
            url: "https://roundz.substack.com/p/interview-experience-meta-sde1-e3",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Hello Interview: Meta E4 guide",
            url: "https://www.hellointerview.com/guides/meta/e4",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "TechScreen: Meta interview process 2026",
            url: "https://techscreen.app/articles/meta-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45 min",
      },
      {
        name: "Onsite coding rounds",
        type: "dsa",
        format:
          "Two coding rounds in most descriptions, each usually with two problems (one guide says one complex problem, and one E4 infrastructure report had a single problem per round). Reported topics are arrays, stacks and strings, trees and backtracking. Difficulty can exceed what the recruiter suggested; one E3 candidate was told to expect mediums and got a round labelled hard.",
        tested: ["algorithm fluency", "speed under pressure", "edge cases", "tracing your own code"],
        grade: "several",
        sources: [
          {
            label: "Roundz: Meta SDE-1 (E3) London experience",
            url: "https://roundz.substack.com/p/interview-experience-meta-sde1-e3",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "DEV: Meta E4 infrastructure experience (rejected)",
            url: "https://dev.to/oa_vo_support/meta-e4-software-engineer-interview-experience-i-was-rejected-45bm",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "DEV: Meta new grad three-round experience",
            url: "https://dev.to/oa_vo_support/meta-new-grad-three-round-interview-experience-can-i-get-an-offer-4o6d",
            kind: "candidate-report",
          },
          {
            label: "TechScreen: Meta interview process 2026",
            url: "https://techscreen.app/articles/meta-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45 min each",
        variesBy:
          "Problem count per round varies between reports. One E3 candidate noted that all their interviewers had an infrastructure background while their own interests were web and app work.",
      },
      {
        name: "AI-enabled coding round",
        type: "dsa",
        format:
          "A pilot format that can replace one standard coding round: one extended task inside a multi-file project with a built-in AI assistant. Interviewers watch how you direct the assistant, verify what it produces and catch its mistakes.",
        tested: [
          "working in an existing codebase",
          "reviewing AI output",
          "debugging",
          "judgement on when to trust the tool",
        ],
        grade: "guide",
        sources: [
          {
            label: "TechScreen: Meta interview process 2026",
            url: "https://techscreen.app/articles/meta-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Hello Interview: Meta E4 guide",
            url: "https://www.hellointerview.com/guides/meta/e4",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Hello Interview: Meta E3 guide",
            url: "https://www.hellointerview.com/guides/meta/e3",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "60 min",
        variesBy:
          "Described as a pilot, with one guide dating it to October 2025. It replaces one standard coding round in some loops, and the E3 guide says it is not guaranteed for E3.",
      },
      {
        name: "System design / product architecture",
        type: "hld",
        format:
          "One design interview, drawn in Excalidraw according to one guide. Candidates on the infrastructure track get a backend-focused system design question; product-track candidates get product architecture (APIs, data model, client-server flows). One 2025 E4 infrastructure report was a distributed counter covering Redis storage and heavy read and write traffic.",
        tested: ["navigating an open problem", "scalable design", "technical depth", "communication"],
        grade: "several",
        sources: [
          {
            label: "DEV: Meta E4 infrastructure experience (rejected)",
            url: "https://dev.to/oa_vo_support/meta-e4-software-engineer-interview-experience-i-was-rejected-45bm",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Hello Interview: Meta E4 guide",
            url: "https://www.hellointerview.com/guides/meta/e4",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "TechScreen: Meta interview process 2026",
            url: "https://techscreen.app/articles/meta-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45 min",
        variesBy:
          "Usually no design round for E3 new grads; one at E4; one or two at E5; two at E6+ (one guide). The E4 guide says weak design or behavioural performance can lead to down-levelling to E3.",
      },
      {
        name: "Behavioural round",
        type: "behavioral",
        format:
          "Questions about real past situations: conflict with a colleague, going beyond the brief, having your suggestions adopted, negative feedback, tight deadlines. The E4 guide expects four to six questions and advises preparing four or five detailed stories. The E3 guide also expects at least one question about using AI at work; the other guides do not mention this.",
        tested: ["ownership", "conflict resolution", "handling ambiguity", "growth mindset", "communication"],
        grade: "several",
        sources: [
          {
            label: "Roundz: Meta SDE-1 (E3) London experience",
            url: "https://roundz.substack.com/p/interview-experience-meta-sde1-e3",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "DEV: Meta E4 infrastructure experience (rejected)",
            url: "https://dev.to/oa_vo_support/meta-e4-software-engineer-interview-experience-i-was-rejected-45bm",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "DEV: Meta new grad three-round experience",
            url: "https://dev.to/oa_vo_support/meta-new-grad-three-round-interview-experience-can-i-get-an-offer-4o6d",
            kind: "candidate-report",
          },
          {
            label: "Hello Interview: Meta E3 guide",
            url: "https://www.hellointerview.com/guides/meta/e3",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45 min",
        variesBy:
          "The E3 guide contradicts itself on weight (coding carries most weight in one place, behavioural as much as coding in another); two guides say it strongly influences level at E4 and above. Its slot in the loop varies; one 2025 candidate had it right after the phone screen.",
      },
      {
        name: "Team matching and offer",
        type: "hr",
        format:
          "After the loop you talk to prospective hiring managers before an offer is made, then discuss compensation and start date with the recruiter. Guides disagree on bootcamp: one says informal team conversations replaced the older bootcamp in 2023, while a 2026 guide says E3-E4 hires usually still do a multi-week bootcamp and then choose a team.",
        tested: ["team fit", "compensation negotiation", "start date"],
        grade: "one",
        sources: [
          {
            label: "Hello Interview: Meta E4 guide",
            url: "https://www.hellointerview.com/guides/meta/e4",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Hello Interview: Meta E3 guide",
            url: "https://www.hellointerview.com/guides/meta/e3",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "TechScreen: Meta interview process 2026",
            url: "https://techscreen.app/articles/meta-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        variesBy:
          "Per one guide, E5 and above are more often matched during or just after the process, sometimes before the offer is finalised.",
      },
    ],
    typicalWeeks: "4-8 weeks (one guide says up to 12 for new grads)",
    gaps: "Meta's careers prep page returned 404, so nothing is official. IGotAnOffer returned 403. The two Hello Interview guides are the same site, so the OA, team-matching and recruiter rounds lean on one vendor. The undated DEV new-grad post has no year. No candidate report described team matching or the offer call, and guides disagree on whether the bootcamp still exists. The AI-enabled round and the AI behavioural question come from guides only.",
  },
  {
    company: "amazon",
    summary:
      "Amazon SDE hiring is an online assessment, then a loop of back-to-back interviews that each blend coding or design with Leadership Principle questions, including one Bar Raiser from outside the team. Design depth is light or absent in SDE-1 reports; the one SDE-2 report had separate LLD and HLD rounds.",
    rounds: [
      {
        name: "Online assessment",
        type: "oa",
        format:
          "Two coding problems, plus a work-simulation section (email-style prioritisation and debugging a business scenario) and a short work-style questionnaire pairing situations with most/least-fitting responses. One guide says the invitation link usually expires after about 7 days.",
        tested: ["coding fundamentals", "prioritisation and decision-making", "alignment with Leadership Principles"],
        grade: "several",
        sources: [
          {
            label: "Amazon Jobs: Interviewing at Amazon",
            url: "https://www.amazon.jobs/content/en/how-we-hire/interviewing-at-amazon",
            kind: "official",
          },
          {
            label: "GeeksforGeeks: Amazon SDE-1 fresher off-campus",
            url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde1-fresher-off-campus/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Bosscoder: Amazon SDE1 interview experience",
            url: "https://www.bosscoderacademy.com/blog/amazon-sde1-interview-experience",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Simplify: Amazon SWE new grad guide",
            url: "https://simplify.jobs/blog/amazon-swe-interview-new-grads",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 70-80 min coding, whole OA 2-3.5 hours",
        variesBy:
          "Reports mainly cover new-grad and SDE-1; experienced hires may differ. Section lengths vary by cycle and region.",
      },
      {
        name: "Technical phone screen",
        type: "phone",
        format:
          "One guide describes a 45-60 minute call with an engineer: about 5 minutes of introduction, 35 on a coding problem and 10 on follow-ups. Amazon's page lists a phone screening stage without details, and the candidate reports I read for SDE-1 jump from the OA straight to the interview rounds.",
        tested: ["problem solving", "complexity analysis", "edge cases"],
        grade: "one",
        sources: [
          {
            label: "Amazon Jobs: Interviewing at Amazon",
            url: "https://www.amazon.jobs/content/en/how-we-hire/interviewing-at-amazon",
            kind: "official",
          },
          {
            label: "Onsites.fyi: Amazon SDE I guide",
            url: "https://www.onsites.fyi/blog/article/amazon-sde-i-software-engineer-interview-questions",
            kind: "prep-guide",
            year: 2025,
          },
        ],
        duration: "45-60 min",
        variesBy:
          "Amazon says the process differs from role to role; the SDE-1 candidate reports read here did not include a phone screen.",
      },
      {
        name: "Coding rounds in the loop",
        type: "dsa",
        format:
          "Often two problems per round (three of the four candidate reports; the fourth describes one problem per round), around medium difficulty (trees, strings, arrays, hash maps, graphs, sliding window). One guide says you write full programs including input parsing, and edge-case follow-ups are common. Reports often pair a coding round with a behavioural question.",
        tested: [
          "data structures and algorithms",
          "complete working code",
          "optimising after a first solution",
          "edge cases",
        ],
        grade: "several",
        sources: [
          {
            label: "GeeksforGeeks: Amazon SDE-1 interview experience",
            url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-14/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "GeeksforGeeks: Amazon SDE-1 fresher off-campus",
            url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde1-fresher-off-campus/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Bosscoder: Amazon SDE1 interview experience",
            url: "https://www.bosscoderacademy.com/blog/amazon-sde1-interview-experience",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Roundz: Amazon SDE-2 interview experience",
            url: "https://roundz.substack.com/p/interview-experience-82-amazon-sde2",
            kind: "candidate-report",
            year: 2025,
          },
        ],
        duration: "60 min each",
        variesBy:
          "The single SDE-2 report shows one coding round with an optimisation follow-up plus separate design rounds; SDE-1 reports show one to three coding rounds.",
      },
      {
        name: "Low-level / object-oriented design",
        type: "lld",
        format:
          "Design a small real-world system with classes and public methods, for example a parking lot or an elevator controller, then extend it with a new requirement such as priority scheduling. One fresher was rejected after this round and blamed limited OOP preparation.",
        tested: ["object-oriented modelling", "class and API design", "extensibility"],
        grade: "several",
        sources: [
          {
            label: "Roundz: Amazon SDE-2 interview experience",
            url: "https://roundz.substack.com/p/interview-experience-82-amazon-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "GeeksforGeeks: Amazon SDE-1 fresher off-campus",
            url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde1-fresher-off-campus/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Onsites.fyi: Amazon SDE I guide",
            url: "https://www.onsites.fyi/blog/article/amazon-sde-i-software-engineer-interview-questions",
            kind: "prep-guide",
            year: 2025,
          },
          {
            label: "Simplify: Amazon SWE new grad guide",
            url: "https://simplify.jobs/blog/amazon-swe-interview-new-grads",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 60 min",
        variesBy: "Not guaranteed at SDE-1 (some candidates got none); clearly present in SDE-2 loops.",
      },
      {
        name: "High-level system design",
        type: "hld",
        format:
          "Design with no code required. The SDE-2 report covered a locker-based delivery system (locker status sync, location prioritisation, fail-safes, full lockers). An SDE-1 report was a bookstore service that counts word occurrences across many books, framed around classes and methods, followed by project discussion. A guide says SDE-1 design is basic if present.",
        tested: ["component design", "scalability and trade-offs", "discussing past projects"],
        grade: "several",
        sources: [
          {
            label: "Roundz: Amazon SDE-2 interview experience",
            url: "https://roundz.substack.com/p/interview-experience-82-amazon-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Bosscoder: Amazon SDE1 interview experience",
            url: "https://www.bosscoderacademy.com/blog/amazon-sde1-interview-experience",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Simplify: Amazon SWE new grad guide",
            url: "https://simplify.jobs/blog/amazon-swe-interview-new-grads",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 60 min",
        variesBy:
          "The one SDE-2 report had a dedicated round; at SDE-1 it is basic or absent in the reports and guides read.",
      },
      {
        name: "Leadership Principles behavioural questions",
        type: "behavioral",
        format:
          "One guide says each loop interviewer is assigned particular Leadership Principles. Candidate reports mention questions on pressure, missed deadlines, tight timelines, unclear requirements, doing something extraordinary for the team and acting against organisational standards. The same guide advises preparing about eight STAR stories.",
        tested: ["ownership", "customer obsession", "dealing with conflict and deadlines", "evidence of impact"],
        grade: "several",
        sources: [
          {
            label: "GeeksforGeeks: Amazon SDE-1 interview experience",
            url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-14/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Roundz: Amazon SDE-2 interview experience",
            url: "https://roundz.substack.com/p/interview-experience-82-amazon-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "GeeksforGeeks: Amazon SDE-1 fresher off-campus",
            url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde1-fresher-off-campus/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Simplify: Amazon SWE new grad guide",
            url: "https://simplify.jobs/blog/amazon-swe-interview-new-grads",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "woven into the other rounds",
      },
      {
        name: "Bar Raiser",
        type: "bar-raiser",
        format:
          "An outside interviewer who combines behavioural scoring with a technical problem. In the one SDE-2 report the behavioural part probed ethical and organisational conflicts, and the coding part was a binary-tree bottom-view problem. A guide says some 2025 SDE-1 candidates got a basic design prompt here.",
        tested: ["standards and judgement", "depth on Leadership Principles", "coding under follow-ups"],
        grade: "several",
        sources: [
          {
            label: "Amazon Jobs: Interviewing at Amazon",
            url: "https://www.amazon.jobs/content/en/how-we-hire/interviewing-at-amazon",
            kind: "official",
          },
          {
            label: "Roundz: Amazon SDE-2 interview experience",
            url: "https://roundz.substack.com/p/interview-experience-82-amazon-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Simplify: Amazon SWE new grad guide",
            url: "https://simplify.jobs/blog/amazon-swe-interview-new-grads",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 60 min",
        variesBy:
          "Amazon's page names Bar Raisers without describing the role. The SDE-1 candidate reports I read did not single one out.",
      },
      {
        name: "Recruiter follow-up and offer",
        type: "hr",
        format:
          "Updates come by automated email or a scheduling tool, and one SDE-1 candidate learned of the result in a later HR call. Amazon's page also mentions a 'Candid Chat' with a member of an employee-led group during the process.",
        tested: ["how updates are communicated", "candid chat with employee group"],
        grade: "one",
        sources: [
          {
            label: "Bosscoder: Amazon SDE1 interview experience",
            url: "https://www.bosscoderacademy.com/blog/amazon-sde1-interview-experience",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Amazon Jobs: Interviewing at Amazon",
            url: "https://www.amazon.jobs/content/en/how-we-hire/interviewing-at-amazon",
            kind: "official",
          },
        ],
        variesBy: "One 2025 SDE-1 report says no updates followed the final round until a later HR call.",
      },
    ],
    typicalWeeks: "new-grad loops took roughly 3-4 months from OA to decision in 2025 per one guide; times are uneven",
    gaps: "Amazon's role-specific SDE prep page returned 404. The Amazon Jobs page I read has no durations or round counts and no year. Medium posts and dsaprep.dev were unreadable. Loop size reports conflict (2 to 5 interviews). Only one SDE-2 candidate report was found, so SDE-2 claims are thin. No candidate source gave offer-stage mechanics or real timeline other than one guide's estimate.",
  },
  {
    company: "microsoft",
    summary:
      "Microsoft's official guidance says to expect two to four conversations of up to an hour, and candidate reports show an online coding test, several coding interviews, a design discussion for experienced candidates, and a hiring-manager round mixing technical and behavioural questions. Loops differ a lot between reports.",
    rounds: [
      {
        name: "Recruiter or team screening",
        type: "phone",
        format:
          "Microsoft's page says the team might schedule a brief screening conversation after resume review to decide who to invite; it gives no length or format. The two candidate reports only say a recruiter reached out (one via LinkedIn, one within about a week of applying).",
        tested: ["suitability for an interview invitation"],
        grade: "one",
        sources: [
          {
            label: "Microsoft Careers: How we hire",
            url: "https://careers.microsoft.com/v2/global/en/hiring-tips.html",
            kind: "official",
          },
          {
            label: "GeeksforGeeks: Microsoft SDE-1 (Hyderabad)",
            url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-1-hyderabad/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "ProgramHelp: Microsoft SDE-II interview record",
            url: "https://programhelp.net/en/vo/microsoft-sde-ii-interview-process-and-preparation-guide/",
            kind: "candidate-report",
          },
        ],
        variesBy: "The official page says the team 'might' hold one, so it is not universal.",
      },
      {
        name: "Online coding assessment",
        type: "oa",
        format:
          "Timed coding test on Codility or HackerRank with two or three problems (strings, matrices, dynamic programming). One SDE-II report needed over 50 percent to pass; a Hyderabad SDE-1 report needed roughly half the problems.",
        tested: ["dynamic programming", "string and matrix manipulation", "timed implementation"],
        grade: "several",
        sources: [
          {
            label: "GeeksforGeeks: Microsoft SDE-1 (Hyderabad)",
            url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-1-hyderabad/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "ProgramHelp: Microsoft SDE-II interview record",
            url: "https://programhelp.net/en/vo/microsoft-sde-ii-interview-process-and-preparation-guide/",
            kind: "candidate-report",
          },
          {
            label: "Jointaro: Microsoft SDE intern, India",
            url: "https://www.jointaro.com/interviews/companies/microsoft/experiences/software-development-engineer-sde-intern-india-september-9-2025-no-offer-positive-546a8ab6/",
            kind: "candidate-report",
            year: 2025,
          },
        ],
        duration: "90-105 min",
        variesBy:
          "Platform and length differ between reports (Codility, 90 min versus HackerRank, 105 min). An Azure SDE-I report does not mention an OA, and an intern report had one after resume shortlisting.",
      },
      {
        name: "Coding interviews",
        type: "dsa",
        format:
          "Two or three technical interviews, in some reports on Teams with a shared coding tool, usually one or two problems each (trees, lists, grids, arrays), with hints and edge-case testing. Microsoft's guidance says interviews can be by phone, Teams or in person, that you code in a language you are strong in with a tool that can compile and run, and that you should test before saying you are done.",
        tested: ["data structures and algorithms", "testing your own solution", "thinking aloud", "optimal approach"],
        grade: "several",
        sources: [
          {
            label: "Microsoft Careers: Technical interviewing",
            url: "https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing",
            kind: "official",
          },
          {
            label: "GeeksforGeeks: Microsoft SDE-I (1 year experienced)",
            url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-i-1-year-experienced/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "GeeksforGeeks: Microsoft SDE-1 (Hyderabad)",
            url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-1-hyderabad/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "ProgramHelp: Microsoft SDE-II interview record",
            url: "https://programhelp.net/en/vo/microsoft-sde-ii-interview-process-and-preparation-guide/",
            kind: "candidate-report",
          },
        ],
        duration: "about 45-60 min each",
        variesBy:
          "Count varies between reports; one candidate went straight to the manager round after two coding rounds.",
      },
      {
        name: "CS fundamentals questions",
        type: "cs",
        format:
          "Not a standalone round in these reports. Operating-systems questions (threads, semaphores, page faults, memory leaks) followed coding problems for one Azure Networking candidate, and a different SDE-II account had database questions (SQL versus NoSQL, CAP, schema changes) in its manager round. Each is a single report.",
        tested: ["operating systems", "concurrency basics", "databases and consistency"],
        grade: "one",
        sources: [
          {
            label: "GeeksforGeeks: Microsoft SDE-I (1 year experienced)",
            url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-i-1-year-experienced/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "ProgramHelp: Microsoft SDE-II interview record",
            url: "https://programhelp.net/en/vo/microsoft-sde-ii-interview-process-and-preparation-guide/",
            kind: "candidate-report",
          },
        ],
        duration: "inside coding or manager rounds",
        variesBy: "Only the Azure Networking report had OS questions; the SDE-II account did not mention any.",
      },
      {
        name: "System design",
        type: "hld",
        format:
          "A design discussion. One report was a URL shortener (the interviewer helped with requirements and throughput estimates); another was an alarm service (single and repeating alarms, notifications, time zones, availability). Microsoft's page says interviews value breaking problems down, asking clarifying questions and planning before implementing.",
        tested: ["requirements gathering", "trade-offs", "capacity estimation", "communication"],
        grade: "several",
        sources: [
          {
            label: "Microsoft Careers: Technical interviewing",
            url: "https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing",
            kind: "official",
          },
          {
            label: "GeeksforGeeks: Microsoft SDE-1 (Hyderabad)",
            url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-1-hyderabad/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "ProgramHelp: Microsoft SDE-II interview record",
            url: "https://programhelp.net/en/vo/microsoft-sde-ii-interview-process-and-preparation-guide/",
            kind: "candidate-report",
          },
        ],
        variesBy:
          "Seen at SDE-1 (1.5 years) and SDE-II; the intern report does not mention one. In the Azure Networking report there was no separate design round, only a mostly low-level cache-design question in the manager round. Neither report gives the round length.",
      },
      {
        name: "Hiring manager round",
        type: "manager",
        format:
          "Content differs across three reports: detailed questions on past work plus a mostly low-level cache design (Azure Networking SDE-I); about 30 minutes of database questions and about 30 of behavioural questions (SDE-II account); and a single hard coding problem with the engineering manager (Hyderabad SDE-1).",
        tested: ["depth of past projects", "technical judgement", "collaboration", "mentoring and influence"],
        grade: "several",
        sources: [
          {
            label: "GeeksforGeeks: Microsoft SDE-I (1 year experienced)",
            url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-i-1-year-experienced/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "ProgramHelp: Microsoft SDE-II interview record",
            url: "https://programhelp.net/en/vo/microsoft-sde-ii-interview-process-and-preparation-guide/",
            kind: "candidate-report",
          },
          {
            label: "GeeksforGeeks: Microsoft SDE-1 (Hyderabad)",
            url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-1-hyderabad/",
            kind: "candidate-report",
            year: 2025,
          },
        ],
        duration: "60 min",
        variesBy: "The three reports share little beyond the round existing.",
      },
      {
        name: "'AA' final round",
        type: "dsa",
        format:
          "One Hyderabad SDE-1 candidate reported a final 'AA' round that was a single medium coding problem, solved in one pass, with the interviewer testing many edge cases. No other source described this stage.",
        tested: ["in-place array manipulation", "edge-case testing", "single-pass solutions"],
        grade: "one",
        sources: [
          {
            label: "GeeksforGeeks: Microsoft SDE-1 (Hyderabad)",
            url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-1-hyderabad/",
            kind: "candidate-report",
            year: 2025,
          },
        ],
        variesBy: "Single-candidate report from one location; may not apply elsewhere.",
      },
      {
        name: "Offer",
        type: "hr",
        format:
          "Microsoft's page says the recruiter shares the timeline for next steps after interviews, then the recruiting team emails offer documents to review and sign, and after acceptance confirms your start date and pre-hire steps. One candidate called HR about two days after the final round and was told they were selected; another said the offer came quickly.",
        tested: ["offer paperwork", "start date and pre-hire steps"],
        grade: "several",
        sources: [
          {
            label: "Microsoft Careers: How we hire",
            url: "https://careers.microsoft.com/v2/global/en/hiring-tips.html",
            kind: "official",
          },
          {
            label: "GeeksforGeeks: Microsoft SDE-I (1 year experienced)",
            url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-i-1-year-experienced/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "ProgramHelp: Microsoft SDE-II interview record",
            url: "https://programhelp.net/en/vo/microsoft-sde-ii-interview-process-and-preparation-guide/",
            kind: "candidate-report",
          },
        ],
      },
    ],
    typicalWeeks:
      "one account runs mid-July to end of August (roughly 6 weeks); the other reports give no timeline, so treat this as thin evidence",
    gaps: "Microsoft's interview-tips page was a 404 and the other official pages give no round names or levels. Glassdoor and LeetCode were unreadable. The ProgramHelp post has no stated year and is an interview-help vendor. Most candidate evidence is India SDE-1/SDE-II; US new-grad loops and the behavioural round as a separate stage were not found. Timeline evidence is thin.",
  },
  {
    company: "apple",
    summary:
      "Apple has no single loop: each team designs its own, usually a recruiter call, an early hiring-manager conversation, one or two technical phone screens, then a half-day to full-day loop of coding, design, domain and behavioural interviews. One guide says the behavioural and system design rounds count for more than coding.",
    rounds: [
      {
        name: "Recruiter call",
        type: "phone",
        format:
          "A mostly non-technical conversation on your resume, projects, interest in the role and logistics, including pay range.",
        tested: ["background and role fit", "motivation", "logistics"],
        grade: "several",
        sources: [
          {
            label: "Drill Insight: Apple SWE interview walkthrough",
            url: "https://www.drillinsight.com/news/apple-interview-experience/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechScreen: Apple SWE interview process",
            url: "https://techscreen.app/articles/apple-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Onsites.fyi: Apple ICT2 SWE guide",
            url: "https://www.onsites.fyi/blog/article/apple-ict2-software-engineer-interview-questions",
            kind: "prep-guide",
            year: 2025,
          },
        ],
        duration: "20-30 min",
        variesBy:
          "One guide says the first step is either a recruiter call or an online assessment, and that some teams use a take-home instead of a phone screen, especially for early-career roles.",
      },
      {
        name: "Hiring-manager screen",
        type: "manager",
        format:
          "A video conversation with the team's hiring manager: a resume walkthrough and a deep dive into one or two projects, sometimes with light technical questions. Guides say the hiring manager leads the hiring decision and largely defines the loop's format.",
        tested: ["project depth", "team fit", "communication"],
        grade: "guide",
        sources: [
          {
            label: "TechScreen: Apple SWE interview process",
            url: "https://techscreen.app/articles/apple-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Prepare.sh: Apple interview process 2026",
            url: "https://prepare.sh/articles/apple-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "interviewing.io: Apple hiring process guide",
            url: "https://interviewing.io/guides/hiring-process/apple",
            kind: "prep-guide",
          },
        ],
        duration: "30-60 min",
        variesBy:
          "One guide says it comes earlier than at Google or Amazon; another says the technical phone screen may itself be a hiring manager screen mixing behavioural questions and coding.",
      },
      {
        name: "Technical phone screen",
        type: "phone",
        format:
          "Coding in a shared editor (CoderPad or the team's own tool), usually one or two problems in the team's language, plus domain follow-ups. Candidates mention a simple text-search feature and medium-to-hard LeetCode-style problems, with few hints.",
        tested: ["arrays, strings and hash tables", "explaining reasoning", "clean code"],
        grade: "several",
        sources: [
          {
            label: "Jointaro: Apple SWE, San Francisco",
            url: "https://www.jointaro.com/interviews/companies/apple/experiences/software-engineer-san-francisco-ca-may-19-2025-declined-offer-positive-03458ea9/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Drill Insight: Apple SWE interview walkthrough",
            url: "https://www.drillinsight.com/news/apple-interview-experience/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechScreen: Apple SWE interview process",
            url: "https://techscreen.app/articles/apple-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45-60 min in two guides; one says 30-60 min",
        variesBy: "One or two screens depending on team; a take-home or online assessment can replace it.",
      },
      {
        name: "Take-home or online assessment",
        type: "take-home",
        format:
          "Some teams give a take-home or online exercise around the phone-screen stage; one guide says the hiring manager decides whether you get one, and an anecdote describes a week-long assignment discussed at the onsite. Guides stress it depends on the team.",
        tested: ["practical engineering", "discussing your own work"],
        grade: "guide",
        sources: [
          {
            label: "interviewing.io: Apple hiring process guide",
            url: "https://interviewing.io/guides/hiring-process/apple",
            kind: "prep-guide",
          },
          {
            label: "TechScreen: Apple SWE interview process",
            url: "https://techscreen.app/articles/apple-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about a week for a take-home (one example)",
        variesBy:
          "Team and hiring-manager dependent; one guide ties it to early-career roles and does not say how long it is.",
      },
      {
        name: "Onsite coding rounds",
        type: "dsa",
        format:
          "Algorithm problems that, per one candidate, were not puzzle-style but needed clean, well-named code and edge-case care. A guide says many teams target roughly LeetCode medium, with one algorithmic and one practical or domain-based coding round for mid and senior roles; one 2025 candidate reported a LeetCode Hard.",
        tested: ["clean readable code", "edge cases", "efficiency", "language fluency"],
        grade: "several",
        sources: [
          {
            label: "Drill Insight: Apple SWE interview walkthrough",
            url: "https://www.drillinsight.com/news/apple-interview-experience/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Jointaro: Apple SWE, San Francisco",
            url: "https://www.jointaro.com/interviews/companies/apple/experiences/software-engineer-san-francisco-ca-may-19-2025-declined-offer-positive-03458ea9/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechScreen: Apple SWE interview process",
            url: "https://techscreen.app/articles/apple-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Onsites.fyi: Apple ICT2 SWE guide",
            url: "https://www.onsites.fyi/blog/article/apple-ict2-software-engineer-interview-questions",
            kind: "prep-guide",
            year: 2025,
          },
        ],
        variesBy:
          "Team decides style: LeetCode-like questions or practical rounds built around a specific technology. No source gives onsite round lengths.",
      },
      {
        name: "Design round",
        type: "hld",
        format:
          "An open-ended design question, for example a log-analysis platform focused on data volume, stability and scalability (one 2025 report). A guide says services teams get system design while client and framework teams get API or component design.",
        tested: ["scalable design", "stability", "API and architecture thinking", "trade-offs"],
        grade: "several",
        sources: [
          {
            label: "Drill Insight: Apple SWE interview walkthrough",
            url: "https://www.drillinsight.com/news/apple-interview-experience/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Jointaro: Apple SWE, San Francisco",
            url: "https://www.jointaro.com/interviews/companies/apple/experiences/software-engineer-san-francisco-ca-may-19-2025-declined-offer-positive-03458ea9/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechScreen: Apple SWE interview process",
            url: "https://techscreen.app/articles/apple-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Onsites.fyi: Apple ICT2 SWE guide",
            url: "https://www.onsites.fyi/blog/article/apple-ict2-software-engineer-interview-questions",
            kind: "prep-guide",
            year: 2025,
          },
        ],
        variesBy:
          "Services teams get system design; client teams get API or component design. An ICT2 guide calls it a standard round but product-scoped (no distributed systems), for example a Photos feature. No source gives its length.",
      },
      {
        name: "Domain deep dive",
        type: "domain",
        format:
          "A round tied to the team's technology: iOS teams probe Swift, UI frameworks, memory and concurrency; cloud teams probe distributed systems; firmware teams probe C/C++ and low-level debugging.",
        tested: ["platform knowledge", "memory management", "debugging", "team-specific stack"],
        grade: "guide",
        sources: [
          {
            label: "TechScreen: Apple SWE interview process",
            url: "https://techscreen.app/articles/apple-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Onsites.fyi: Apple ICT2 SWE guide",
            url: "https://www.onsites.fyi/blog/article/apple-ict2-software-engineer-interview-questions",
            kind: "prep-guide",
            year: 2025,
          },
          {
            label: "interviewing.io: Apple hiring process guide",
            url: "https://interviewing.io/guides/hiring-process/apple",
            kind: "prep-guide",
          },
        ],
        variesBy: "Team-driven; one guide says one or two such rounds, another says one.",
      },
      {
        name: "Behavioural and team-fit conversations",
        type: "behavioral",
        format:
          "One or two rounds (per one guide) with a manager, partner-team engineer or designer/PM, plus a chat with team members in one 2025 loop. Reported questions cover project conflict and quality under tight deadlines. One 2025 candidate felt most of the onsite was behavioural and conceptual design, and that personality and fit mattered more than skills.",
        tested: ["team fit", "craftsmanship", "ownership", "collaboration"],
        grade: "several",
        sources: [
          {
            label: "Jointaro: Apple SWE, San Francisco",
            url: "https://www.jointaro.com/interviews/companies/apple/experiences/software-engineer-san-francisco-ca-may-19-2025-declined-offer-positive-03458ea9/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Drill Insight: Apple SWE interview walkthrough",
            url: "https://www.drillinsight.com/news/apple-interview-experience/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "interviewing.io: Apple hiring process guide",
            url: "https://interviewing.io/guides/hiring-process/apple",
            kind: "prep-guide",
          },
          {
            label: "TechScreen: Apple SWE interview process",
            url: "https://techscreen.app/articles/apple-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        variesBy:
          "interviewing.io says behavioural and system design rounds matter more than coding; the other sources do not rank them.",
      },
      {
        name: "Senior-manager follow-up",
        type: "manager",
        format:
          "An optional extra conversation with a senior manager or director, described by one guide as final calibration of level and leadership signal. The guide does not say whether every process includes it.",
        tested: ["level calibration", "leadership signal"],
        grade: "one",
        sources: [
          {
            label: "TechScreen: Apple SWE interview process",
            url: "https://techscreen.app/articles/apple-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "30-60 min",
        variesBy: "Optional; the guide does not say which candidates get it.",
      },
      {
        name: "Offer",
        type: "hr",
        format:
          "One 2025 candidate reported receiving an offer. One guide calls the offer stage slow and variable; another says the hiring team proposes your level, which is confirmed during the offer process, with results taking a few days to a few weeks. Mechanics of the HR call were not described by any source.",
        tested: ["level confirmation", "compensation negotiation", "team-proposed level"],
        grade: "one",
        sources: [
          {
            label: "Jointaro: Apple SWE, San Francisco",
            url: "https://www.jointaro.com/interviews/companies/apple/experiences/software-engineer-san-francisco-ca-may-19-2025-declined-offer-positive-03458ea9/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Prepare.sh: Apple interview process 2026",
            url: "https://prepare.sh/articles/apple-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "TechScreen: Apple SWE interview process",
            url: "https://techscreen.app/articles/apple-technical-interview-process-2026",
            kind: "prep-guide",
            year: 2026,
          },
        ],
      },
    ],
    typicalWeeks: "4-8 weeks in recent guides; reports range from about 3 weeks to 4 months",
    gaps: "No official Apple description found; 1point3acres and Glassdoor were blocked and onsites.fyi's main page was paywalled. Only two readable candidate reports for 2025, both dated 19 May 2025 and possibly overlapping. No source gives onsite round lengths. ICT level mapping is unofficial. No new-grad-specific loop confirmed.",
  },
  {
    company: "netflix",
    summary:
      "Netflix hiring is run team by team: a recruiter call, often a hiring-manager conversation, a technical screen, then a virtual loop of coding, system design, data modelling or domain rounds and behavioural interviews that test the culture memo. Reports are mostly experienced-hire.",
    rounds: [
      {
        name: "Recruiter screen",
        type: "phone",
        format:
          "One or two calls (per one guide) covering your background, motivation and the culture memo, with compensation expectations possibly raised on the first call. The two candidate reports confirm a recruiter screen but give no detail on it.",
        tested: ["role fit", "motivation", "culture awareness"],
        grade: "several",
        sources: [
          {
            label: "Jointaro: Netflix SWE, New York (accepted offer)",
            url: "https://www.jointaro.com/interviews/companies/netflix/experiences/software-engineer-new-york-ny-may-18-2025-accepted-offer-positive-5be31adb/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Jointaro: Netflix Senior SWE (L5), United States",
            url: "https://www.jointaro.com/interviews/companies/netflix/experiences/senior-software-engineer-united-states-january-22-2025-no-offer-positive-b131bf1d/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Aced: Netflix SWE interview guide",
            url: "https://www.aced.io/guides/netflix-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        variesBy:
          "One guide says some teams hold a second call that explains the onsite structure and may preview technical topics.",
      },
      {
        name: "Hiring-manager conversation",
        type: "manager",
        format:
          "A conversation with the hiring manager about past work and team fit. Position in the process varies: before the technical screen, after team matching, or folded into the onsite behavioural rounds. Sources disagree on whether it is a relaxed 30-minute call or a structured 45-minute behavioural interview, and one calls the first phone screen with the hiring manager a culture-fit check only.",
        tested: ["past work", "team fit", "culture fit"],
        grade: "guide",
        sources: [
          {
            label: "Aced: Netflix SWE interview guide",
            url: "https://www.aced.io/guides/netflix-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "CopilotInterview: Netflix interview process",
            url: "https://copilotinterview.com/blog/netflix-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Prepfully: Netflix SWE interview guide",
            url: "https://prepfully.com/interview-guides/netflix-software-engineer",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "30-45 min",
        variesBy:
          "Team decides timing and format; one guide says team matching can add 2-3 weeks for intern and new-grad candidates.",
      },
      {
        name: "Technical screen",
        type: "phone",
        format:
          "Live coding with a current team member on CoderPad or CodeSignal, according to one guide, which adds that some prompts are tied to a Netflix use case. One 2025 L5 candidate got a very vague content-manager (CRUD) problem and advised asking clarifying questions and coding quickly because follow-ups come; a January 2026 Ads-org candidate got a topological sort.",
        tested: ["clarifying vague requirements", "medium-difficulty coding", "follow-up trade-offs"],
        grade: "several",
        sources: [
          {
            label: "Jointaro: Netflix Senior SWE (L5), United States",
            url: "https://www.jointaro.com/interviews/companies/netflix/experiences/senior-software-engineer-united-states-january-22-2025-no-offer-positive-b131bf1d/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "PracHub: Netflix Senior SWE onsite in Ads org",
            url: "https://prachub.com/interview-experiences/netflix-senior-software-engineer-interview-experience-onsite-loop-in-the-ads-org-topo-sort-system-design-and-two-bqs",
            kind: "candidate-report",
            year: 2026,
          },
          {
            label: "Aced: Netflix SWE interview guide",
            url: "https://www.aced.io/guides/netflix-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45-60 min",
        variesBy:
          "One guide says some teams offer a take-home instead, some split the screen into a coding round and a problem-solving round, and front-end teams use starter files and milestones.",
      },
      {
        name: "Onsite coding",
        type: "dsa",
        format:
          "A coding round in the virtual loop. One January 2026 Ads-org candidate got a variant of the screen's topological-sort problem with follow-up asks. A 2025 candidate said the technical questions were not LeetCode-style and needed no tricks. A guide says it can be standard DSA or practical, such as React.",
        tested: ["problem solving", "extending a working solution", "practical code"],
        grade: "several",
        sources: [
          {
            label: "PracHub: Netflix Senior SWE onsite in Ads org",
            url: "https://prachub.com/interview-experiences/netflix-senior-software-engineer-interview-experience-onsite-loop-in-the-ads-org-topo-sort-system-design-and-two-bqs",
            kind: "candidate-report",
            year: 2026,
          },
          {
            label: "Jointaro: Netflix SWE, New York (accepted offer)",
            url: "https://www.jointaro.com/interviews/companies/netflix/experiences/software-engineer-new-york-ny-may-18-2025-accepted-offer-positive-5be31adb/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Aced: Netflix SWE interview guide",
            url: "https://www.aced.io/guides/netflix-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        variesBy: "Team-specific; front-end loops may include practical React work.",
      },
      {
        name: "System design",
        type: "hld",
        format:
          "A design round whose content depends on the team. An Ads-org candidate was probed on ads frequency capping (Redis internals, traffic handling, atomicity, online and offline paths, queue choice); another report lists a streaming-platform architecture question. A guide describes it as a design challenge or trade-off discussion.",
        tested: ["scale and correctness trade-offs", "caching and queues", "domain reasoning", "verbal explanation"],
        grade: "several",
        sources: [
          {
            label: "PracHub: Netflix Senior SWE onsite in Ads org",
            url: "https://prachub.com/interview-experiences/netflix-senior-software-engineer-interview-experience-onsite-loop-in-the-ads-org-topo-sort-system-design-and-two-bqs",
            kind: "candidate-report",
            year: 2026,
          },
          {
            label: "Jointaro: Netflix SWE, New York (accepted offer)",
            url: "https://www.jointaro.com/interviews/companies/netflix/experiences/software-engineer-new-york-ny-may-18-2025-accepted-offer-positive-5be31adb/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Jointaro: Netflix SWE, Denmark",
            url: "https://www.jointaro.com/interviews/companies/netflix/experiences/software-engineer-denmark-november-2-2025-no-offer-positive-fc3de479/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "CopilotInterview: Netflix interview process",
            url: "https://copilotinterview.com/blog/netflix-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        variesBy:
          "Team-specific; one guide says some senior loops add debugging, craftsmanship or operational-mindset rounds.",
      },
      {
        name: "Data modelling / concurrency / domain round",
        type: "domain",
        format:
          "A data-modelling round for some teams, covering how the main entities connect (campaigns, business accounts, creatives and user targeting for an ads team; the candidate was unsure whether it was a separate session). A 2025 New York candidate separately listed a concurrency round, with no detail.",
        tested: ["data modelling", "concurrency", "end-to-end flow thinking"],
        grade: "several",
        sources: [
          {
            label: "PracHub: Netflix Senior SWE onsite in Ads org",
            url: "https://prachub.com/interview-experiences/netflix-senior-software-engineer-interview-experience-onsite-loop-in-the-ads-org-topo-sort-system-design-and-two-bqs",
            kind: "candidate-report",
            year: 2026,
          },
          {
            label: "Jointaro: Netflix SWE, New York (accepted offer)",
            url: "https://www.jointaro.com/interviews/companies/netflix/experiences/software-engineer-new-york-ny-may-18-2025-accepted-offer-positive-5be31adb/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Aced: Netflix SWE interview guide",
            url: "https://www.aced.io/guides/netflix-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        variesBy:
          "A guide says data modelling is for some teams, such as ads; the concurrency round comes from a single report.",
      },
      {
        name: "Behavioural and culture rounds",
        type: "behavioral",
        format:
          "Two behavioural interviews appear in two candidate reports, one with managers; a guide says they can be manager-led or recruiter-led. A 2025 candidate listed their questions as coming from the culture document, and a January 2026 candidate advises matching your experience closely to the job description. Netflix's culture page lists eight values: selflessness, judgment, candor, creativity, courage, inclusion, curiosity and resilience.",
        tested: ["culture values", "candor", "judgement", "fit with the job description"],
        grade: "several",
        sources: [
          {
            label: "Jointaro: Netflix SWE, New York (accepted offer)",
            url: "https://www.jointaro.com/interviews/companies/netflix/experiences/software-engineer-new-york-ny-may-18-2025-accepted-offer-positive-5be31adb/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "PracHub: Netflix Senior SWE onsite in Ads org",
            url: "https://prachub.com/interview-experiences/netflix-senior-software-engineer-interview-experience-onsite-loop-in-the-ads-org-topo-sort-system-design-and-two-bqs",
            kind: "candidate-report",
            year: 2026,
          },
          {
            label: "Aced: Netflix SWE interview guide",
            url: "https://www.aced.io/guides/netflix-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Netflix Jobs: Culture",
            url: "https://jobs.netflix.com/culture",
            kind: "official",
          },
        ],
        variesBy: "One guide reports candidates saying a weak culture round can sink an otherwise strong loop.",
      },
      {
        name: "Director or skip-level conversation",
        type: "manager",
        format:
          "Some loops include one or two conversations with engineering directors or a senior director. One guide places a second onsite with two engineering directors (45 minutes each) after good feedback from the first.",
        tested: ["leadership signal", "senior-level fit"],
        grade: "guide",
        sources: [
          {
            label: "Prepfully: Netflix SWE interview guide",
            url: "https://prepfully.com/interview-guides/netflix-software-engineer",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Aced: Netflix SWE interview guide",
            url: "https://www.aced.io/guides/netflix-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "CopilotInterview: Netflix interview process",
            url: "https://copilotinterview.com/blog/netflix-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 45 min each (one guide)",
        variesBy:
          "Guides disagree: one says it appears on some teams and not others, another says most onsite loops have one or two directors.",
      },
      {
        name: "HR conversation",
        type: "hr",
        format:
          "One guide lists a final HR interview in the first onsite session and says intern and new-grad candidates may spend a further two to three weeks in team matching after the technical rounds. A January 2026 candidate got their result about two days after a two-day onsite.",
        tested: ["final HR interview", "team matching"],
        grade: "guide",
        sources: [
          {
            label: "Prepfully: Netflix SWE interview guide",
            url: "https://prepfully.com/interview-guides/netflix-software-engineer",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "CopilotInterview: Netflix interview process",
            url: "https://copilotinterview.com/blog/netflix-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "PracHub: Netflix Senior SWE onsite in Ads org",
            url: "https://prachub.com/interview-experiences/netflix-senior-software-engineer-interview-experience-onsite-loop-in-the-ads-org-topo-sort-system-design-and-two-bqs",
            kind: "candidate-report",
            year: 2026,
          },
        ],
        variesBy: "The extra matching time is reported for intern and new-grad candidates only.",
      },
    ],
    typicalWeeks: "as little as about 3 weeks for some teams; team matching can add 2-3 weeks",
    gaps: "No official Netflix page describes the process; the culture page only lists values. Candidate evidence is mostly experienced/senior (one L5) and from a handful of teams (ads, a New York team). Round durations are mostly unreported. Early-career (new-grad/intern) loop evidence comes only from prep sites. Glassdoor and LeetCode were unreadable.",
  },
  {
    company: "uber",
    summary:
      "Uber's SDE-2 loop in India is reported as an online assessment and a screen, then several further rounds mixing DSA, design and a hiring-manager conversation. One candidate called it very difficult, and an SDE-2 author says the low-level design round expects working code.",
    rounds: [
      {
        name: "Online assessment",
        type: "oa",
        format:
          "Timed coding test, reported on CodeSignal by an SDE-II candidate and by one guide. A 2025 intern candidate described three problems based on real-world challenges.",
        tested: ["algorithmic coding problems", "speed under a timer"],
        grade: "several",
        sources: [
          {
            label: "Jointaro: Uber SDE-II Bengaluru, Feb 2025",
            url: "https://www.jointaro.com/interviews/companies/uber/experiences/software-engineer-ii-bengaluru-february-1-2025-no-offer-neutral-52af2520/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Aced: Uber SDE 2 interview (India)",
            url: "https://www.aced.io/experiences/uber-software-engineer-interview-db9df6",
            kind: "candidate-report",
          },
          {
            label: "Jointaro: Uber SDE intern Noida, Oct 2025",
            url: "https://www.jointaro.com/interviews/companies/uber/experiences/sde-intern-noida-uttar-pradesh-october-1-2025-no-offer-positive-9d31fa4a/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechPrep: Uber interview process",
            url: "https://www.techprep.app/blog/uber-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "70-90 min (one guide)",
        variesBy:
          "A Bengaluru SDE-II report (Feb 2025) and a 2025 intern report both have it. A senior Bengaluru report (Oct 2024) starts with a hiring-manager interview and does not mention one.",
      },
      {
        name: "Phone / technical screen",
        type: "phone",
        format:
          "A live call. The Feb 2025 SDE-II report describes some general computer-science questions followed by one DSA question. One guide says the engineering manager of the hiring team runs it, with a coding problem and a short work-experience chat.",
        tested: ["core CS basics", "data structures and algorithms", "work experience (one guide)"],
        grade: "several",
        sources: [
          {
            label: "Jointaro: Uber SDE-II Bengaluru, Feb 2025",
            url: "https://www.jointaro.com/interviews/companies/uber/experiences/software-engineer-ii-bengaluru-february-1-2025-no-offer-neutral-52af2520/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Aced: Uber SDE 2 interview (India)",
            url: "https://www.aced.io/experiences/uber-software-engineer-interview-db9df6",
            kind: "candidate-report",
          },
          {
            label: "Interview Kickstart: Uber tech interview process",
            url: "https://interviewkickstart.com/blogs/interview-questions/uber-tech-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "interviewing.io: Uber interview guide",
            url: "https://interviewing.io/uber-interview-questions",
            kind: "prep-guide",
          },
        ],
        duration: "about 40-60 min (guide estimate)",
        variesBy: "Who runs it and which platform (CodeSignal or HackerRank) differ between sources.",
      },
      {
        name: "DSA coding rounds",
        type: "dsa",
        format:
          "Two DSA-heavy rounds in the Feb 2025 SDE-II loop, the second blended with coding or design. One candidate was asked tree and graph problems (binary tree diameter, distance between two graph points). A guide calls the problems mostly medium difficulty and expects code that compiles and runs.",
        tested: ["trees and graphs", "data structures and algorithms", "code that runs"],
        grade: "several",
        sources: [
          {
            label: "Jointaro: Uber SDE-II Bengaluru, Feb 2025",
            url: "https://www.jointaro.com/interviews/companies/uber/experiences/software-engineer-ii-bengaluru-february-1-2025-no-offer-neutral-52af2520/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Aced: Uber SDE 2 interview (India)",
            url: "https://www.aced.io/experiences/uber-software-engineer-interview-db9df6",
            kind: "candidate-report",
          },
          {
            label: "Uber careers: Landing the job at Uber, Backend Engineer",
            url: "https://jobs.uber.com/en/people-stories/interview-prep/landing-the-job-at-uber-backend-engineer/",
            kind: "official",
          },
          {
            label: "interviewing.io: Uber interview guide",
            url: "https://interviewing.io/uber-interview-questions",
            kind: "prep-guide",
          },
        ],
        duration: "about 60 min each (guide)",
        variesBy:
          "Uber's own careers story for a backend engineer lists three coding interviews; the 2025 SDE-II report lists two DSA-heavy rounds.",
      },
      {
        name: "Low-level design / coding with design",
        type: "lld",
        format:
          "An object-oriented design problem. One SDE-2 author says LLD requires working code, and a guide describes a machine-coding round for 2026 SDE-2 candidates that emphasises OOP and extensibility. A 2025 intern loop listed an LLD round; the Feb 2025 SDE-II report has no separate one.",
        tested: ["object-oriented design", "working extensible code"],
        grade: "several",
        sources: [
          {
            label: "Jointaro: Uber SDE-II Bengaluru, Feb 2025",
            url: "https://www.jointaro.com/interviews/companies/uber/experiences/software-engineer-ii-bengaluru-february-1-2025-no-offer-neutral-52af2520/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Aced: Uber SDE 2 interview (India)",
            url: "https://www.aced.io/experiences/uber-software-engineer-interview-db9df6",
            kind: "candidate-report",
          },
          {
            label: "Jointaro: Uber SDE intern Noida, Oct 2025",
            url: "https://www.jointaro.com/interviews/companies/uber/experiences/sde-intern-noida-uttar-pradesh-october-1-2025-no-offer-positive-9d31fa4a/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechPrep: Uber interview process",
            url: "https://www.techprep.app/blog/uber-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45-60 min (one guide)",
        variesBy:
          "Not every report lists a separate LLD round; the Feb 2025 SDE-II loop has a 'DSA plus coding/design' round instead. A 2025 intern loop had a separate LLD round.",
      },
      {
        name: "System design",
        type: "hld",
        format:
          "A design discussion. One candidate was asked to walk through their most significant past project; another reported being asked to design a car-rental system and a stock-ticker system. Uber's own careers story for a backend engineer lists two design and architecture interviews.",
        tested: ["system design", "explaining a past project"],
        grade: "several",
        sources: [
          {
            label: "Jointaro: Uber SDE-II Bengaluru, Feb 2025",
            url: "https://www.jointaro.com/interviews/companies/uber/experiences/software-engineer-ii-bengaluru-february-1-2025-no-offer-neutral-52af2520/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Aced: Uber SDE 2 interview (India)",
            url: "https://www.aced.io/experiences/uber-software-engineer-interview-db9df6",
            kind: "candidate-report",
          },
          {
            label: "Uber careers: Landing the job at Uber, Backend Engineer",
            url: "https://jobs.uber.com/en/people-stories/interview-prep/landing-the-job-at-uber-backend-engineer/",
            kind: "official",
          },
          {
            label: "interviewing.io: Uber interview guide",
            url: "https://interviewing.io/uber-interview-questions",
            kind: "prep-guide",
          },
        ],
        duration: "about 60 min (one guide)",
        variesBy:
          "One guide says mid-level and senior candidates get one or two rounds. The reported prompts differ between candidates.",
      },
      {
        name: "Hiring manager / collaboration and leadership",
        type: "manager",
        format:
          "A conversation with the hiring manager, listed as the last round in the Feb 2025 SDE-II report. One guide describes a collaboration and leadership round on past projects or how you would deliver future ones, and one candidate advised not to underestimate it because it carried more weight.",
        tested: ["past projects", "collaboration", "leadership", "handling failure (one guide)"],
        grade: "several",
        sources: [
          {
            label: "Jointaro: Uber SDE-II Bengaluru, Feb 2025",
            url: "https://www.jointaro.com/interviews/companies/uber/experiences/software-engineer-ii-bengaluru-february-1-2025-no-offer-neutral-52af2520/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Jointaro: Uber Senior SWE Bengaluru, Oct 2024",
            url: "https://www.jointaro.com/interviews/companies/uber/experiences/senior-software-engineer-bengaluru-october-1-2024-accepted-offer-positive-dd2ed38b/",
            kind: "candidate-report",
            year: 2024,
          },
          {
            label: "Aced: Uber SDE 2 interview (India)",
            url: "https://www.aced.io/experiences/uber-software-engineer-interview-db9df6",
            kind: "candidate-report",
          },
          {
            label: "Uber careers: Landing the job at Uber, Backend Engineer",
            url: "https://jobs.uber.com/en/people-stories/interview-prep/landing-the-job-at-uber-backend-engineer/",
            kind: "official",
          },
        ],
        duration: "75 min (one guide)",
        variesBy:
          "A senior Bengaluru report (Oct 2024) says the hiring-manager interview came first, followed by several parallel rounds; the Feb 2025 SDE-II report places it last. Uber's careers story names a collaboration and leadership interview but not a hiring manager.",
      },
      {
        name: "Bar raiser",
        type: "bar-raiser",
        format:
          "One guide describes an interviewer from outside the hiring team running a deep dive into one past project, used to help decide your level. Only that guide mentions this round, and none of the candidate reports read here list it.",
        tested: ["depth on a past project", "leveling signal"],
        grade: "guide",
        sources: [
          {
            label: "interviewing.io: Uber interview guide",
            url: "https://interviewing.io/uber-interview-questions",
            kind: "prep-guide",
          },
        ],
        duration: "about 60 min (one guide)",
        variesBy:
          "The guide says staff candidates need a project spanning at least two to three quarters, while senior candidates can use a less complex one.",
      },
      {
        name: "Hiring committee and offer",
        type: "hr",
        format:
          "One guide says results are reviewed by a hiring committee after the loop, and that most candidates hear back within three to five business days. Another guide describes the interview panel meeting to decide, with team matching either at the start or the end.",
        tested: ["overall loop signal", "level fit"],
        grade: "guide",
        sources: [
          {
            label: "TechPrep: Uber interview process",
            url: "https://www.techprep.app/blog/uber-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Jointaro: Uber software engineer Hyderabad, Jul 2023 (campus)",
            url: "https://www.jointaro.com/interviews/companies/uber/experiences/software-engineer-hyderabad-july-17-2023-declined-offer-positive-15df3243/",
            kind: "candidate-report",
            year: 2023,
          },
          {
            label: "interviewing.io: Uber interview guide",
            url: "https://interviewing.io/uber-interview-questions",
            kind: "prep-guide",
          },
        ],
        variesBy:
          "One guide says matching can happen at the start or the end and can take weeks to months. A 2023 Hyderabad campus drive had four rounds and ended with a managerial and HR interview instead.",
      },
    ],
    typicalWeeks: "2-6 weeks (one guide), 4-6 weeks (another); one candidate report says about 5 weeks",
    gaps: "Uber's own careers pages are undated and give no durations or India-specific rounds. LeetCode, Glassdoor and 1point3acres threads (the richest recent SDE-2 reports) returned 403, so round order and the 2025-26 LLD round rest on a few Jointaro/Aced pages plus guides. Bar raiser and committee are single-guide claims. Duration figures mostly come from guides, and the 2026 LLD detail is one guide. The Feb 2025 report gives no durations.",
  },
  {
    company: "atlassian",
    summary:
      "Atlassian publishes its engineering interview stages: two coding parts, a system design round, a manager interview and a separate values interview, then a hiring committee. Candidate reports roughly match this shape, and one calls the values round the most stressful part.",
    rounds: [
      {
        name: "Recruiter screen",
        type: "phone",
        format:
          "A call about your background, interest in Atlassian and logistics such as pay expectations and location. The recruiter also confirms which seniority level (P-level) you are being considered for.",
        tested: ["motivation", "role and level fit", "logistics"],
        grade: "guide",
        sources: [
          {
            label: "TechPrep: Atlassian's interview process",
            url: "https://www.techprep.app/blog/atlassian-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "30 min",
      },
      {
        name: "Online assessment / technical screen",
        type: "oa",
        format:
          "An early coding screen before the main loop. Intern reports describe a timed LeetCode-style problem or a short live coding call. One guide says a third-party interviewer from Karat runs it, with quick fundamentals questions then one or two problems, and a retake is possible.",
        tested: ["networking and OS fundamentals (one guide)", "working code under time"],
        grade: "one",
        sources: [
          {
            label: "TechPrep: Atlassian's interview process",
            url: "https://www.techprep.app/blog/atlassian-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Jointaro: Atlassian software engineer intern experiences",
            url: "https://www.jointaro.com/interviews/companies/atlassian/work-experiences/software-engineer-intern-gdansk-april-14-2025-5-f5453aa1/",
            kind: "candidate-report",
            year: 2024,
          },
        ],
        variesBy:
          "The Karat detail comes from one guide only; the candidate reports I could read are intern and US/Australia based. Not every India report mentions a screen.",
      },
      {
        name: "Coding: data structures",
        type: "dsa",
        format:
          "Live coding in the language of your choice. The official page splits the coding interview into data structures and code design, and says trade-offs such as verbosity versus optimisation matter. One guide says interviewers look at code quality, naming and whether you test your own code.",
        tested: ["problem solving", "readable code", "testing your own solution", "trade-offs"],
        grade: "several",
        sources: [
          {
            label: "Atlassian: engineering interviewing guide",
            url: "https://www.atlassian.com/company/careers/resources/interviewing/engineering",
            kind: "official",
          },
          {
            label: "Jointaro: Atlassian software developer experiences",
            url: "https://www.jointaro.com/interviews/companies/atlassian/work-experiences/software-developer-may-19-2025-2-80f09956",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechPrep: Atlassian's interview process",
            url: "https://www.techprep.app/blog/atlassian-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "60 min (one guide)",
        variesBy: "The official page lists frontend, backend, fullstack and SRE tracks.",
      },
      {
        name: "Code design / craft",
        type: "lld",
        format:
          "The official page lists code design as the second part of the coding interview. A guide describes a real-world task, with a backend popularity-tracking system and a frontend debounced search bar as examples. A US intern candidate advised being comfortable creating classes and using hash maps.",
        tested: ["code design", "code quality", "practical coding task"],
        grade: "several",
        sources: [
          {
            label: "Atlassian: engineering interviewing guide",
            url: "https://www.atlassian.com/company/careers/resources/interviewing/engineering",
            kind: "official",
          },
          {
            label: "Jointaro: Atlassian software engineer intern experiences",
            url: "https://www.jointaro.com/interviews/companies/atlassian/work-experiences/software-engineer-intern-gdansk-april-14-2025-5-f5453aa1/",
            kind: "candidate-report",
            year: 2024,
          },
          {
            label: "TechPrep: Atlassian's interview process",
            url: "https://www.techprep.app/blog/atlassian-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "60 min (one guide)",
        variesBy: "The guide's examples differ for backend and frontend.",
      },
      {
        name: "System design",
        type: "hld",
        format:
          "A discussion about real engineering challenges such as architecture or scaling under given conditions, not mainly about writing code. Follow-up questions tighten or change the constraints to see how you adapt. A guide cites Jira-notification and Confluence-editor style prompts.",
        tested: [
          "clarifying requirements",
          "reliability and cost reasoning",
          "technology choices",
          "adapting to new constraints",
        ],
        grade: "several",
        sources: [
          {
            label: "Atlassian: engineering interviewing guide",
            url: "https://www.atlassian.com/company/careers/resources/interviewing/engineering",
            kind: "official",
          },
          {
            label: "Jointaro: Atlassian software developer experiences",
            url: "https://www.jointaro.com/interviews/companies/atlassian/work-experiences/software-developer-may-19-2025-2-80f09956",
            kind: "candidate-report",
            year: 2024,
          },
          {
            label: "TechPrep: Atlassian's interview process",
            url: "https://www.techprep.app/blog/atlassian-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "60 min",
        variesBy: "A Pune report (Nov 2024) lists it as the second of three rounds: technical, system design, manager.",
      },
      {
        name: "Manager interview",
        type: "manager",
        format:
          "One-to-one with the hiring manager or a senior manager. The official page says it covers your background, the impact you could have, growth paths and how you collaborate, and that you should be ready to discuss past projects including the business justification.",
        tested: ["project depth", "collaboration", "impact and growth", "communication"],
        grade: "several",
        sources: [
          {
            label: "Atlassian: engineering interviewing guide",
            url: "https://www.atlassian.com/company/careers/resources/interviewing/engineering",
            kind: "official",
          },
          {
            label: "Jointaro: Atlassian software developer experiences",
            url: "https://www.jointaro.com/interviews/companies/atlassian/work-experiences/software-developer-may-19-2025-2-80f09956",
            kind: "candidate-report",
            year: 2024,
          },
        ],
        variesBy:
          "A Pune report (Nov 2024) lists it as the third of three rounds, after one technical and one system design round.",
      },
      {
        name: "Values interview",
        type: "behavioral",
        format:
          "An informal conversation, usually with someone outside the hiring team such as sales, HR or support, about Atlassian's five values and the mindset behind your actions. An intern candidate gave an example of applying each value, and a Gdansk candidate called this the most stressful round.",
        tested: ["alignment with company values", "mindset and humility", "customer empathy", "personal examples"],
        grade: "several",
        sources: [
          {
            label: "Atlassian: engineering interviewing guide",
            url: "https://www.atlassian.com/company/careers/resources/interviewing/engineering",
            kind: "official",
          },
          {
            label: "Jointaro: Atlassian software developer experiences",
            url: "https://www.jointaro.com/interviews/companies/atlassian/work-experiences/software-developer-may-19-2025-2-80f09956",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Jointaro: Atlassian software engineer intern experiences",
            url: "https://www.jointaro.com/interviews/companies/atlassian/work-experiences/software-engineer-intern-gdansk-april-14-2025-5-f5453aa1/",
            kind: "candidate-report",
            year: 2024,
          },
          {
            label: "TechPrep: Atlassian's interview process",
            url: "https://www.techprep.app/blog/atlassian-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45-60 min (one guide)",
        variesBy: "One guide says interviewers in 2025 favoured answers showing humility and customer empathy.",
      },
      {
        name: "Hiring committee, HR and offer",
        type: "hr",
        format:
          "Interviewers pool feedback, then a committee independent of them reviews feedback and CV for a holistic decision. A Hyderabad report from Oct 2025 lists a final HR round that covered salary.",
        tested: ["overall skills and behaviours", "level fit", "compensation alignment"],
        grade: "several",
        sources: [
          {
            label: "Atlassian: engineering interviewing guide",
            url: "https://www.atlassian.com/company/careers/resources/interviewing/engineering",
            kind: "official",
          },
          {
            label: "Jointaro: Atlassian software developer experiences",
            url: "https://www.jointaro.com/interviews/companies/atlassian/work-experiences/software-developer-may-19-2025-2-80f09956",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechPrep: Atlassian's interview process",
            url: "https://www.techprep.app/blog/atlassian-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
      },
    ],
    typicalWeeks: "3-6 weeks (guide); individual reports range from about 2 weeks to over 2 months",
    gaps: "The official page is undated and gives a duration only for system design. LeetCode and Glassdoor India SDE-2/SDE-3 reports were unreadable, so level differences (P-levels) and India-specific details rest on three short Jointaro pages and a guide. Karat screen, recruiter call and most durations are guide-only.",
  },
  {
    company: "razorpay",
    summary:
      "Razorpay is described as a machine-coding-first process: a coding test or DSA screen, a build-it-yourself low-level design round, a system design round for SDE-2 and above, then hiring manager and HR. Almost everything here comes from prep guides; the only candidate report read is an undated campus internship page.",
    rounds: [
      {
        name: "Recruiter screen",
        type: "phone",
        format:
          "A short intro call about your background, current role and interest in Razorpay, with room to ask about the team.",
        tested: ["role fit", "motivation", "compensation basics"],
        grade: "guide",
        sources: [
          {
            label: "TechPrep: Razorpay's interview process",
            url: "https://www.techprep.app/blog/razorpay-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "SpaceComplexity: Razorpay software engineer interview",
            url: "https://spacecomplexity.ai/blog/razorpay-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "15-30 min",
      },
      {
        name: "Online assessment",
        type: "oa",
        format:
          "A proctored test mixing multiple-choice questions with two or three coding problems. One guide puts the MCQs on OS and DBMS and the coding at easy-to-medium; guides name HackerEarth, Evaluate or HackerRank as the platform. An undated campus internship report describes a 90-minute test of MCQs plus three coding problems.",
        tested: ["OS and DBMS basics", "easy-medium DSA", "OOP fundamentals"],
        grade: "one",
        sources: [
          {
            label: "TechPrep: Razorpay's interview process",
            url: "https://www.techprep.app/blog/razorpay-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "SpaceComplexity: Razorpay software engineer interview",
            url: "https://spacecomplexity.ai/blog/razorpay-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "GeeksforGeeks: Razorpay internship interview (on-campus)",
            url: "https://www.geeksforgeeks.org/?p=674213",
            kind: "candidate-report",
          },
        ],
        duration: "90-120 min (one guide)",
        variesBy:
          "One guide says an OA is not consistently reported, so the DSA round may be the first real gate. The only candidate source is undated and for campus interns.",
      },
      {
        name: "DSA technical interview",
        type: "dsa",
        format:
          "A live round with an engineer. One guide describes a video call on a shared editor with one or two medium problems; guides list arrays, hash maps, two pointers, sliding window, trees, graphs and some DP. One guide advises solving cleanly and explaining well. Harder problems are reported at senior levels by one guide.",
        tested: ["medium DSA", "clear explanation of your solution"],
        grade: "one",
        sources: [
          {
            label: "SpaceComplexity: Razorpay software engineer interview",
            url: "https://spacecomplexity.ai/blog/razorpay-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Thita: Razorpay interview questions and process",
            url: "https://thita.ai/blog/interview/razorpay-interview-questions-and-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "GeeksforGeeks: Razorpay internship interview (on-campus)",
            url: "https://www.geeksforgeeks.org/?p=674213",
            kind: "candidate-report",
          },
        ],
        duration: "about 60 min (one guide)",
        variesBy:
          "One guide says senior levels get occasional hard problems. The only candidate evidence read is an undated campus internship.",
      },
      {
        name: "Machine coding / low-level design",
        type: "machine-coding",
        format:
          "Build a working in-memory system from an under-specified prompt, with running code expected rather than pseudocode. Guides say interviewers may add requirements mid-round to test extensibility, and two call it the main filter or bar-setting round. One guide says payments-style care (idempotency, state transitions, concurrency) is worth demonstrating.",
        tested: ["clean modular design", "working core flow", "extensibility", "edge cases", "concurrency basics"],
        grade: "guide",
        sources: [
          {
            label: "TechPrep: Razorpay's interview process",
            url: "https://www.techprep.app/blog/razorpay-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "SpaceComplexity: Razorpay software engineer interview",
            url: "https://spacecomplexity.ai/blog/razorpay-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Thita: Razorpay interview questions and process",
            url: "https://thita.ai/blog/interview/razorpay-interview-questions-and-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "60-120 min",
        variesBy: "Guides disagree on length (60-90, about 90 and 90-120 min).",
      },
      {
        name: "High-level design",
        type: "hld",
        format:
          "An architecture discussion on a whiteboard tool (one guide names Miro or Excalidraw). Guides say it focuses on scalability, fault tolerance and trade-offs, and two add a payments angle with idempotency, consistency and slow or failing dependencies.",
        tested: ["scalability", "fault tolerance", "idempotency and retries", "trade-off reasoning"],
        grade: "guide",
        sources: [
          {
            label: "TechPrep: Razorpay's interview process",
            url: "https://www.techprep.app/blog/razorpay-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "SpaceComplexity: Razorpay software engineer interview",
            url: "https://spacecomplexity.ai/blog/razorpay-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Thita: Razorpay interview questions and process",
            url: "https://thita.ai/blog/interview/razorpay-interview-questions-and-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 60 min",
        variesBy:
          "Two guides place it at SDE-2 and above; one adds that SDE-1 may have it merged into the manager round.",
      },
      {
        name: "Hiring manager",
        type: "manager",
        format:
          "Guides describe a deep dive into past projects, technology decisions, and how you handle conflict, failure and disagreement, with some attention to product intuition and what you owned.",
        tested: ["project depth", "ownership", "handling failure", "product intuition"],
        grade: "guide",
        sources: [
          {
            label: "TechPrep: Razorpay's interview process",
            url: "https://www.techprep.app/blog/razorpay-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "SpaceComplexity: Razorpay software engineer interview",
            url: "https://spacecomplexity.ai/blog/razorpay-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Thita: Razorpay interview questions and process",
            url: "https://thita.ai/blog/interview/razorpay-interview-questions-and-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45-60 min",
        variesBy:
          "For senior roles a bar-raiser style round may replace or add to this one, with more leadership focus (one guide).",
      },
      {
        name: "HR and offer",
        type: "hr",
        format:
          "A short call on compensation and culture or logistics. One guide says successful candidates often hear a verbal offer within a few days.",
        tested: ["compensation expectations", "culture fit", "joining logistics"],
        grade: "guide",
        sources: [
          {
            label: "TechPrep: Razorpay's interview process",
            url: "https://www.techprep.app/blog/razorpay-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "SpaceComplexity: Razorpay software engineer interview",
            url: "https://spacecomplexity.ai/blog/razorpay-software-engineer-interview",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "15-30 min",
      },
    ],
    typicalWeeks: "2-4 weeks (two guides)",
    gaps: "No readable candidate report for an SDE role at Razorpay: LeetCode, Glassdoor, Medium (member-only) and Naukri Code360 returned 403 or thin pages, and the one GeeksforGeeks page is an undated campus internship. Guides give different round counts and durations. No official Razorpay engineering interview page found.",
  },
  {
    company: "flipkart",
    summary:
      "Flipkart SDE-2 loops are reported as a machine coding round with a code review, one or two problem-solving (DSA) rounds, a design round, and a hiring manager conversation. Frontend candidates also get UI-tech and product-sense rounds. Details vary by year and team.",
    rounds: [
      {
        name: "Online assessment",
        type: "oa",
        format:
          "A timed coding screen with algorithm problems, hosted on HackerRank or HackerEarth according to one guide. None of the candidate reports read mentions it; one 2024 report says the first step after a recruiter reached out was machine coding.",
        tested: ["algorithmic problem solving", "speed under a timer"],
        grade: "guide",
        sources: [
          {
            label: "TechPrep: Flipkart's interview process",
            url: "https://www.techprep.app/blog/flipkart-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "90-120 min (one guide)",
        variesBy: "Not mentioned in any candidate report read here, so whether it applies to a given route is unknown.",
      },
      {
        name: "Machine coding and review",
        type: "machine-coding",
        format:
          "Build a working solution to a real-world problem (a food ordering system in one 2025 report). A 2024 report describes it as screen-recorded and proctored with no interviewer present. A guide and a frontend report describe a review afterwards where the interviewer goes through the code, and the guide says you may be asked to extend it. One report says the code had to compile and be testable.",
        tested: [
          "object-oriented design",
          "SOLID and patterns",
          "working, testable code",
          "modularity and naming",
          "edge cases",
        ],
        grade: "several",
        sources: [
          {
            label: "Jointaro: Flipkart SDE2 Bengaluru experiences",
            url: "https://www.jointaro.com/interviews/companies/flipkart/work-experiences/software-engineer-ii-sde2-bengaluru-june-27-2025-4-71b229f5/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Roundz: Flipkart frontend engineer SDE2",
            url: "https://roundz.substack.com/p/flipkart-interview-experience-frontend-engineer-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "GeeksforGeeks: Flipkart SDE-1 interview (machine coding)",
            url: "https://www.geeksforgeeks.org/?p=1040466",
            kind: "candidate-report",
          },
          {
            label: "TechPrep: Flipkart's interview process",
            url: "https://www.techprep.app/blog/flipkart-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 90-120 min, plus a 30-45 min review (one guide)",
        variesBy:
          "Frontend candidates build a small UI app in plain HTML/CSS/JS (120 min, Apr 2025). An undated SDE-1 report allowed about 2 hours and focused on edge cases more than OOP.",
      },
      {
        name: "Problem solving and data structures",
        type: "dsa",
        format:
          "One or two live rounds with about two coding problems each (two LeetCode-medium problems in a 2025 SDE2 report; a guide says medium-to-hard). A 2023 SDE-1 report says interviewers asked for alternative approaches and ways to cut time and space, and varied the questions somewhat.",
        tested: ["medium-hard DSA", "complexity trade-offs", "alternative approaches", "adapting to follow-ups"],
        grade: "several",
        sources: [
          {
            label: "Jointaro: Flipkart SDE2 Bengaluru experiences",
            url: "https://www.jointaro.com/interviews/companies/flipkart/work-experiences/software-engineer-ii-sde2-bengaluru-june-27-2025-4-71b229f5/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "GeeksforGeeks: Flipkart SDE-1 off-campus 2023",
            url: "https://geeksforgeeks.org/flipkart-interview-experience-for-sde1-off-campus-2023",
            kind: "candidate-report",
            year: 2023,
          },
          {
            label: "Roundz: Flipkart frontend engineer SDE2",
            url: "https://roundz.substack.com/p/flipkart-interview-experience-frontend-engineer-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechPrep: Flipkart's interview process",
            url: "https://www.techprep.app/blog/flipkart-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 60 min per round",
        variesBy:
          "A 2023 SDE-1 off-campus loop had two such rounds, one running about 45 minutes over; an undated SDE-1 referral report had one round of two questions in 30 minutes. The frontend SDE-2 report included promise and tree problems.",
      },
      {
        name: "Low-level design round",
        type: "lld",
        format:
          "An object-oriented design discussion. One 2025 SDE2 report calls it a system design round that was LLD-based, with a notification system to design. A guide mentions class diagrams, schema and design-pattern justification.",
        tested: ["class design", "schema design", "design patterns", "justifying choices"],
        grade: "one",
        sources: [
          {
            label: "Jointaro: Flipkart SDE2 Bengaluru experiences",
            url: "https://www.jointaro.com/interviews/companies/flipkart/work-experiences/software-engineer-ii-sde2-bengaluru-june-27-2025-4-71b229f5/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechPrep: Flipkart's interview process",
            url: "https://www.techprep.app/blog/flipkart-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        variesBy: "Not reported in every loop; the 2023 SDE-1 loop had none.",
      },
      {
        name: "High-level design",
        type: "hld",
        format:
          "A guide describes an architecture round covering CAP, microservices and traffic spikes such as a big sale, for SDE-2 and SDE-3 only. No candidate report read describes a separate HLD round, so treat it as a guide claim.",
        tested: ["architecture", "scalability", "trade-off reasoning"],
        grade: "guide",
        sources: [
          {
            label: "TechPrep: Flipkart's interview process",
            url: "https://www.techprep.app/blog/flipkart-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        variesBy: "SDE-2 and above only, per the guide.",
      },
      {
        name: "UI technical round (frontend track)",
        type: "domain",
        format:
          "Frontend-specific questions and coding in one April 2025 report: implementing Promise.all, memoization, debouncing and throttling, centering with Flexbox, and web performance topics such as web vitals, the critical rendering path and lazy loading.",
        tested: ["JavaScript internals", "CSS layout", "web performance", "utility implementation"],
        grade: "one",
        sources: [
          {
            label: "Roundz: Flipkart frontend engineer SDE2",
            url: "https://roundz.substack.com/p/flipkart-interview-experience-frontend-engineer-sde2",
            kind: "candidate-report",
            year: 2025,
          },
        ],
        duration: "60 min",
        variesBy: "Frontend (UI2/WDE2) track only; one report, April 2025.",
      },
      {
        name: "Product sense (frontend track)",
        type: "domain",
        format:
          "An open-ended discussion rather than an engineering problem: design a two-player game, propose features and rank them P0/P1/P2, then discuss MVP trade-offs. The candidate called it the hardest round.",
        tested: ["product thinking", "prioritisation", "MVP trade-offs"],
        grade: "one",
        sources: [
          {
            label: "Roundz: Flipkart frontend engineer SDE2",
            url: "https://roundz.substack.com/p/flipkart-interview-experience-frontend-engineer-sde2",
            kind: "candidate-report",
            year: 2025,
          },
        ],
        duration: "45 min",
        variesBy: "Reported only for the frontend track, April 2025.",
      },
      {
        name: "Hiring manager",
        type: "manager",
        format:
          "A discussion of projects, tech stacks, teamwork and difficulties faced, plus motivation for joining Flipkart and leaving your current employer (2023 SDE-1 report). The frontend SDE-2 report adds mentoring and conflict questions and technical depth such as web security and integrating a third-party payment system.",
        tested: ["project ownership", "teamwork and conflict", "motivation", "technical depth on past work"],
        grade: "several",
        sources: [
          {
            label: "GeeksforGeeks: Flipkart SDE-1 off-campus 2023",
            url: "https://geeksforgeeks.org/flipkart-interview-experience-for-sde1-off-campus-2023",
            kind: "candidate-report",
            year: 2023,
          },
          {
            label: "Roundz: Flipkart frontend engineer SDE2",
            url: "https://roundz.substack.com/p/flipkart-interview-experience-frontend-engineer-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Jointaro: Flipkart SDE2 Bengaluru experiences",
            url: "https://www.jointaro.com/interviews/companies/flipkart/work-experiences/software-engineer-ii-sde2-bengaluru-june-27-2025-4-71b229f5/",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "GeeksforGeeks: Flipkart SDE-1 interview (machine coding)",
            url: "https://www.geeksforgeeks.org/?p=1040466",
            kind: "candidate-report",
          },
        ],
        duration: "30-60 min",
        variesBy:
          "The 2023 SDE-1 session was scheduled for 30 minutes and ran about an hour; an undated SDE-1 report says 30 to 35 minutes; the frontend SDE-2 session was 60 minutes.",
      },
    ],
    gaps: "No official Flipkart interview page. The LeetCode SDE-2 posts (2025-26), Glassdoor and similar were 403, so the HLD round, OA and any HR/offer stage are not backed by a readable candidate report. No overall timeline found. One GeeksforGeeks page is undated; the 2023 one mentions no machine coding round.",
  },
  {
    company: "swiggy",
    summary:
      "Swiggy loops reported for SDE-2/3 combine DSA, a low-level design round, a high-level design round and a hiring manager conversation. The SDE-2 report and guides mention an online test; the SDE-3 report starts with a recruiter call and a telephonic screen. Guides add a machine coding round of up to 2 hours and a bar raiser, but the candidate reports read here do not confirm machine coding.",
    rounds: [
      {
        name: "Online assessment",
        type: "oa",
        format:
          "Timed coding test with about three DSA problems on a hiring platform. One SDE-2 candidate could only use Java, Python or Go; guides mention delivery-themed framing and sometimes a SQL question.",
        tested: ["medium-hard DSA", "language-restricted coding", "dynamic programming", "binary search"],
        grade: "one",
        sources: [
          {
            label: "Aced: Swiggy SDE-2 interview",
            url: "https://www.aced.io/experiences/swiggy-software-engineer-interview-0092bf",
            kind: "candidate-report",
          },
          {
            label: "Design Gurus: Swiggy interview process",
            url: "https://www.designgurus.io/answers/detail/what-is-the-swiggy-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
          {
            label: "TechPrep: Swiggy's interview process",
            url: "https://www.techprep.app/blog/swiggy-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "75-90 min (one guide)",
        variesBy:
          "The SDE-3 report starts with a recruiter call and a telephonic screen and mentions no test. A guide says campus reports describe a 90-minute test with one SQL and three coding questions.",
      },
      {
        name: "Telephonic screen",
        type: "phone",
        format:
          "In the SDE-3 report, a short introduction followed by a deep dive into the candidate's most challenging project: challenges, technical choices and lessons learned. A guide describes a 15-30 minute recruiter call at this stage instead.",
        tested: ["project depth", "design reasoning", "learning from challenges"],
        grade: "one",
        sources: [
          {
            label: "Roundz: Swiggy SDE-3 (L8) interview experience",
            url: "https://roundz.substack.com/p/interview-experience-123-swiggy-sde3-l8",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechPrep: Swiggy's interview process",
            url: "https://www.techprep.app/blog/swiggy-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "60 min",
        variesBy:
          "Reported for an SDE-3 (L8) candidate in a post dated July 2025; the SDE-2 report read does not describe it.",
      },
      {
        name: "Coding and CS fundamentals",
        type: "cs",
        format:
          "Questions on deployment practice, an API latency increase after a release, ordering across Kafka partitions and functional testing, followed by two coding problems (longest run of consecutive integers and a linked-list pointer problem).",
        tested: ["backend fundamentals", "production debugging", "Kafka basics", "data structures"],
        grade: "one",
        sources: [
          {
            label: "Roundz: Swiggy SDE-3 (L8) interview experience",
            url: "https://roundz.substack.com/p/interview-experience-123-swiggy-sde3-l8",
            kind: "candidate-report",
            year: 2025,
          },
        ],
        duration: "60 min",
        variesBy: "One SDE-3 report only.",
      },
      {
        name: "Problem solving and data structures",
        type: "dsa",
        format:
          "A live round with an interviewer. In the SDE-3 report the task was implementing a JSON parser in Java with error handling, finishing with a chat on on-call culture and production incidents. A guide describes a standard 60-minute live DSA round that discusses running time and memory cost.",
        tested: ["parsing and implementation", "error handling", "complexity reasoning", "production mindset"],
        grade: "one",
        sources: [
          {
            label: "Roundz: Swiggy SDE-3 (L8) interview experience",
            url: "https://roundz.substack.com/p/interview-experience-123-swiggy-sde3-l8",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechPrep: Swiggy's interview process",
            url: "https://www.techprep.app/blog/swiggy-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "60 min",
        variesBy:
          "The SDE-2 report read shows DSA only inside the online test; the live round above is from the SDE-3 report.",
      },
      {
        name: "Machine coding",
        type: "machine-coding",
        format:
          "Guides call this Swiggy's signature round: build a runnable system from written requirements (parking lot or expense-sharing style) and be judged on structure and ease of adding features. None of the candidate reports I could read include it.",
        tested: ["runnable modular code", "class organisation", "extensibility"],
        grade: "guide",
        sources: [
          {
            label: "TechPrep: Swiggy's interview process",
            url: "https://www.techprep.app/blog/swiggy-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Design Gurus: Swiggy interview process",
            url: "https://www.designgurus.io/answers/detail/what-is-the-swiggy-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
        ],
        duration: "90-120 min",
        variesBy:
          "Guides say experienced hires only; campus drives skip it. The SDE-3 loop I read had a separate 60-minute LLD round instead.",
      },
      {
        name: "Low-level design",
        type: "lld",
        format:
          "An SDE-3 candidate designed a feature around Swiggy's serviceability, with discussion of object modelling, handling states and extensibility. An SDE-2 candidate's notes list a notification-system LLD question. A guide describes LLD as classes, interfaces and relationships.",
        tested: ["object modelling", "state handling", "extensibility"],
        grade: "several",
        sources: [
          {
            label: "Roundz: Swiggy SDE-3 (L8) interview experience",
            url: "https://roundz.substack.com/p/interview-experience-123-swiggy-sde3-l8",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Aced: Swiggy SDE-2 interview",
            url: "https://www.aced.io/experiences/swiggy-software-engineer-interview-0092bf",
            kind: "candidate-report",
          },
          {
            label: "Design Gurus: Swiggy interview process",
            url: "https://www.designgurus.io/answers/detail/what-is-the-swiggy-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
        ],
        duration: "60 min",
        variesBy: "One guide says LLD is for SDE-1/SDE-2 while seniors get system design; the SDE-3 report had both.",
      },
      {
        name: "High-level design",
        type: "hld",
        format:
          "A system design discussion. The SDE-3 candidate designed a promotional notification system covering push architecture, targeting, scale, rate limiting, retries and queues. A guide folds HLD, project deep-dives and ambiguity handling into the senior bar-raiser round.",
        tested: ["scalable architecture", "queues and retries", "rate limiting", "handling ambiguity"],
        grade: "one",
        sources: [
          {
            label: "Roundz: Swiggy SDE-3 (L8) interview experience",
            url: "https://roundz.substack.com/p/interview-experience-123-swiggy-sde3-l8",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechPrep: Swiggy's interview process",
            url: "https://www.techprep.app/blog/swiggy-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "60 min",
        variesBy:
          "One guide says seniors get system design; another folds architecture into the bar-raiser round for SDE-2 and above.",
      },
      {
        name: "Bar raiser",
        type: "bar-raiser",
        format:
          "One SDE-2 candidate reached this round after clearing the online test and was rejected after it; the page gives no detail on what was asked. One guide says it is led by a senior engineer from another team and covers high-level design, project deep-dives and handling ambiguity.",
        tested: ["design judgement", "project depth", "handling ambiguity"],
        grade: "one",
        sources: [
          {
            label: "Aced: Swiggy SDE-2 interview",
            url: "https://www.aced.io/experiences/swiggy-software-engineer-interview-0092bf",
            kind: "candidate-report",
          },
          {
            label: "TechPrep: Swiggy's interview process",
            url: "https://www.techprep.app/blog/swiggy-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        variesBy: "One guide says it is more common for SDE-2 and above. Single candidate report, date unclear.",
      },
      {
        name: "Hiring manager",
        type: "manager",
        format:
          "In the SDE-3 report, a behavioural round on leadership, ownership, driving a feature end to end and handling technical disagreements. One guide says it covers projects, decisions you owned and why you applied; another mentions alignment with Swiggy's values.",
        tested: ["ownership", "leadership", "conflict resolution", "values alignment"],
        grade: "one",
        sources: [
          {
            label: "Roundz: Swiggy SDE-3 (L8) interview experience",
            url: "https://roundz.substack.com/p/interview-experience-123-swiggy-sde3-l8",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Design Gurus: Swiggy interview process",
            url: "https://www.designgurus.io/answers/detail/what-is-the-swiggy-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
          {
            label: "TechPrep: Swiggy's interview process",
            url: "https://www.techprep.app/blog/swiggy-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "30-60 min (one guide)",
        variesBy:
          "The SDE-3 report lists it as 60 minutes; one guide says senior candidates may also get systems-fundamentals questions.",
      },
      {
        name: "HR round",
        type: "hr",
        format:
          "One guide says some candidates report a short final call about motivation, notice period and logistics, and that the written offer can arrive well after the verbal confirmation.",
        tested: ["motivation", "notice period", "logistics"],
        grade: "guide",
        sources: [
          {
            label: "Design Gurus: Swiggy interview process",
            url: "https://www.designgurus.io/answers/detail/what-is-the-swiggy-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
        ],
        duration: "20-30 min",
        variesBy: "Described as only 'some reports' by one guide.",
      },
    ],
    typicalWeeks: "2-6 weeks and 3-5 weeks in two guides; one SDE-3 reported about a month, one SDE-2 about one week",
    gaps: "LeetCode Swiggy SDE-1/SDE-2 posts (2025-26), Glassdoor and Naukri Code360 were 403, so SDE-1 and campus details rest on guides. Candidate evidence is one Roundz SDE-3 post (July 2025) and one undated Aced SDE-2 page. Machine coding and the HR round are not confirmed by any candidate report read here.",
  },
  {
    company: "phonepe",
    summary:
      "PhonePe SDE-2 candidates describe a machine coding round with a code review, usually a DSA round, a system design round and a hiring manager discussion; one 2022 loop had no DSA round. One 2025 candidate cleared all four rounds but received no offer letter because PhonePe could not match the pay they quoted.",
    rounds: [
      {
        name: "Online / offline coding assessment",
        type: "oa",
        format:
          "A timed coding test. A 2023 campus drive used an in-person 90-minute test with four problems (binary search, trees with expected value, dynamic programming, one unknown). A guide describes about 90 minutes on a platform such as HackerRank or CodeSignal with two or three problems. One 2025 SDE-2 candidate instead did a CodeSignal take-home machine coding task.",
        tested: ["binary search", "trees and DP", "reading unclear output formats"],
        grade: "one",
        sources: [
          {
            label: "GeeksforGeeks: PhonePe software engineer campus interview",
            url: "https://www.geeksforgeeks.org/?p=1048663",
            kind: "candidate-report",
            year: 2023,
          },
          {
            label: "TechPrep: PhonePe's interview process",
            url: "https://www.techprep.app/blog/phonepe-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 90 min",
        variesBy:
          "The 2023 campus drive used an in-person test after an AMCAT filter. The three SDE-2 reports read begin with machine coding and mention no separate test.",
      },
      {
        name: "Machine coding and code review",
        type: "machine-coding",
        format:
          "Build an in-memory, object-oriented system, such as a to-do tracker with analytics, a vehicle rental system or an e-commerce product search backend. A follow-up review probes structure, extensibility, tests and scaling. Can be live or a take-home.",
        tested: [
          "clean object-oriented design",
          "modularity",
          "writing tests",
          "time management",
          "design patterns and thread safety",
        ],
        grade: "several",
        sources: [
          {
            label: "Roundz: PhonePe SDE2 experience 130",
            url: "https://roundz.substack.com/p/interview-experience-130-phonepe-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Roundz: PhonePe SDE2 experience 174",
            url: "https://roundz.substack.com/p/interview-experience-174-phonepe-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Roundz: PhonePe SDE2 experience 101",
            url: "https://roundz.substack.com/p/interview-experience-101-phonepe-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechPrep: PhonePe's interview process",
            url: "https://www.techprep.app/blog/phonepe-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "90-120 min coding, plus a 15-30 min review where reported",
        variesBy:
          "One candidate ran out of time before adding tests and was given a redo with a booking system. Another report is for May 2022 interviews, posted 2025.",
      },
      {
        name: "Problem solving / DSA",
        type: "dsa",
        format:
          "Two or three problems, rated medium to difficult by the candidates: coin distribution in a binary tree and prefix-sum counting in one report; a minimum spanning tree discussion plus stack and graph problems in another. A 2023 campus candidate had two interviews of two problems each, with interviewer hints and a knapsack-style question.",
        tested: ["trees and graphs", "prefix sums and DP", "explaining approach", "working with hints"],
        grade: "several",
        sources: [
          {
            label: "Roundz: PhonePe SDE2 experience 174",
            url: "https://roundz.substack.com/p/interview-experience-174-phonepe-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Roundz: PhonePe SDE2 experience 101",
            url: "https://roundz.substack.com/p/interview-experience-101-phonepe-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "GeeksforGeeks: PhonePe software engineer campus interview",
            url: "https://www.geeksforgeeks.org/?p=1048663",
            kind: "candidate-report",
            year: 2023,
          },
          {
            label: "TechPrep: PhonePe's interview process",
            url: "https://www.techprep.app/blog/phonepe-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 60 min (35-40 min each in a campus drive)",
        variesBy:
          "The May 2022 SDE-2 loop had no separate DSA round. The 2023 campus report had two DSA interviews followed by a techno-HR round.",
      },
      {
        name: "System design",
        type: "hld",
        format:
          "Design a large product: a Quora-style Q&A platform (two reports) or a search engine with crawler and query services (one report). Discussion covered SQL versus NoSQL, search and feed, capacity estimation, API gateway authentication and fault-tolerant design.",
        tested: [
          "service decomposition",
          "SQL versus NoSQL choice",
          "search and indexing",
          "capacity estimation",
          "fault tolerance",
        ],
        grade: "several",
        sources: [
          {
            label: "Roundz: PhonePe SDE2 experience 130",
            url: "https://roundz.substack.com/p/interview-experience-130-phonepe-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Roundz: PhonePe SDE2 experience 174",
            url: "https://roundz.substack.com/p/interview-experience-174-phonepe-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Roundz: PhonePe SDE2 experience 101",
            url: "https://roundz.substack.com/p/interview-experience-101-phonepe-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechPrep: PhonePe's interview process",
            url: "https://www.techprep.app/blog/phonepe-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 60 min",
        variesBy:
          "One guide says SDE-1 design leans to LLD (classes, schema) while SDE-2 leans to distributed systems with payment concerns.",
      },
      {
        name: "Hiring manager",
        type: "manager",
        format:
          "In one report the manager briefly introduced the team, then went through the candidate's current project: proposed improvements, the choice of MongoDB, replication and sharding, team size. Another report adds an open-ended design of a distributed compute cluster. A third is behavioural, covering why the candidate is leaving, salary expectations and why PhonePe.",
        tested: [
          "depth on own project",
          "design trade-offs",
          "motivation for switching",
          "scoping open-ended problems",
        ],
        grade: "several",
        sources: [
          {
            label: "Roundz: PhonePe SDE2 experience 130",
            url: "https://roundz.substack.com/p/interview-experience-130-phonepe-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Roundz: PhonePe SDE2 experience 174",
            url: "https://roundz.substack.com/p/interview-experience-174-phonepe-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Roundz: PhonePe SDE2 experience 101",
            url: "https://roundz.substack.com/p/interview-experience-101-phonepe-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "GeeksforGeeks: PhonePe software engineer campus interview",
            url: "https://www.geeksforgeeks.org/?p=1048663",
            kind: "candidate-report",
            year: 2023,
          },
        ],
        duration: "45-60 min",
        variesBy:
          "Campus loop ends with a 40-45 minute techno-HR round mixing project, React/backend and behavioural questions (2023).",
      },
      {
        name: "HR and compensation",
        type: "hr",
        format:
          "A guide describes a final 30-minute conversation on culture fit and pay expectations. One 2025 candidate cleared all four rounds, was then asked about expected compensation, and received no offer letter because PhonePe could not match the figure quoted.",
        tested: ["compensation expectations", "culture fit"],
        grade: "one",
        sources: [
          {
            label: "Roundz: PhonePe SDE2 experience 174",
            url: "https://roundz.substack.com/p/interview-experience-174-phonepe-sde2",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "TechPrep: PhonePe's interview process",
            url: "https://www.techprep.app/blog/phonepe-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 30 min (guide)",
        variesBy:
          "Only the guide describes a separate HR round; none of the three SDE-2 reports lists one, and one of them covered salary expectations in the hiring-manager round.",
      },
    ],
    typicalWeeks: "2-4 weeks (one guide); one SDE-2 report says the process took about 3 months",
    gaps: "No official PhonePe process page. LeetCode (SDE-1, backend 3-5 yrs, 2025-26), Glassdoor and Naukri were 403 or unfetched, so SDE-1 and non-Bengaluru variants rest on one campus report and a guide. Roundz post 130 covers 2022 interviews; its blog date is 2025. Timelines come from one guide and one candidate report.",
  },
];
