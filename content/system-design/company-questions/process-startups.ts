import type { CompanyProcess } from "./process-types";

export const PROCESS_STARTUPS: CompanyProcess[] = [
  {
    company: "zomato",
    summary:
      "Readable reports describe an online test, one or two DSA-and-projects interviews, a longer round that digs into your projects and fundamentals, and a short HR chat. No standalone machine-coding round was found; design questions show up inside technical rounds, and two guides place them in a separate design-and-fundamentals round.",
    rounds: [
      {
        name: "Online assessment",
        type: "oa",
        format:
          "Timed online test with coding problems of rising difficulty: three in one campus report, two to three in a guide. The other campus report says coding plus MCQ. It is used to shortlist before interviews.",
        tested: ["easy parsing or data-stream problem", "binary search", "shortest-path graph problem"],
        grade: "several",
        sources: [
          {
            label: "Zomato FTE on-campus 2023 (GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=1140290",
            kind: "candidate-report",
            year: 2023,
          },
          {
            label: "Zomato SDE-1 on-campus 2023 (GeeksforGeeks)",
            url: "https://geeksforgeeks.org/zomato-interview-experience-for-sde-1-on-campus-2023",
            kind: "candidate-report",
            year: 2023,
          },
          {
            label: "Zomato interview process (TechPrep)",
            url: "https://www.techprep.app/companies/zomato",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "90 minutes (one campus report)",
        variesBy:
          "Reports are campus hires; one guide says the platform is usually HackerRank or an internal one and adds debugging tasks.",
      },
      {
        name: "Technical round 1: coding and resume",
        type: "dsa",
        format:
          "The SDE-1 report opens with an internship discussion, then two coding problems and a puzzle. The FTE report has a bit-manipulation ice-breaker, a small password-hashing task coded on paper, a project discussion and a topic of the candidate's choice. A prep guide says live DSA then a resume deep dive, 60 to 80 minutes.",
        tested: [
          "data structures and algorithms",
          "bit manipulation warm-up",
          "puzzle solving",
          "internship or project explanation",
        ],
        grade: "several",
        sources: [
          {
            label: "Zomato SDE-1 on-campus 2023 (GeeksforGeeks)",
            url: "https://geeksforgeeks.org/zomato-interview-experience-for-sde-1-on-campus-2023",
            kind: "candidate-report",
            year: 2023,
          },
          {
            label: "Zomato FTE on-campus 2023 (GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=1140290",
            kind: "candidate-report",
            year: 2023,
          },
          {
            label: "Zomato interview process (TechPrep)",
            url: "https://www.techprep.app/companies/zomato",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "30 to 60 minutes in campus reports",
        variesBy: "Both reports are campus hires, and the problems asked differ a lot between them.",
      },
      {
        name: "Project and architecture deep dive",
        type: "domain",
        format:
          "The longest round in both campus reports. The FTE report covers an internship's architecture and metrics, designing an alternative architecture, and a puzzle. The SDE-1 report covers three projects, system design within them, and operating-systems questions.",
        tested: ["project ownership", "architecture reasoning", "operating systems"],
        grade: "several",
        sources: [
          {
            label: "Zomato SDE-1 on-campus 2023 (GeeksforGeeks)",
            url: "https://geeksforgeeks.org/zomato-interview-experience-for-sde-1-on-campus-2023",
            kind: "candidate-report",
            year: 2023,
          },
          {
            label: "Zomato FTE on-campus 2023 (GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=1140290",
            kind: "candidate-report",
            year: 2023,
          },
        ],
        duration: "About 1.5 hours (FTE report); about 2 hours for one SDE-1 candidate and about 1 hour for others",
        variesBy: "Described for campus hires; length differs between candidates.",
      },
      {
        name: "Design and fundamentals round",
        type: "hld",
        format:
          "Prep guides place high-level and low-level design inside a second technical round, alongside OS, databases and networking, sometimes with a concurrency coding task or object design. Both guides are secondary and do not name the reports they draw on.",
        tested: ["system design", "low-level object design", "databases and networking", "concurrency"],
        grade: "guide",
        sources: [
          {
            label: "What to expect in the Zomato system design interview (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-to-expect-in-the-zomato-system-design-interview",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Zomato interview process (TechPrep)",
            url: "https://www.techprep.app/companies/zomato",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "About 60 minutes (guide figure)",
        variesBy:
          "The guides do not say which levels get this round; the campus reports fold design questions into the project round instead.",
      },
      {
        name: "Manager and culture round",
        type: "manager",
        format:
          "Guides describe a manager conversation that revisits past projects and design decisions and probes ownership and customer focus; one says it is frequently onsite at the Gurgaon office. No first-hand account of this round was readable.",
        tested: ["past project decisions", "ownership", "customer focus"],
        grade: "guide",
        sources: [
          {
            label: "Zomato interview process (TechPrep)",
            url: "https://www.techprep.app/companies/zomato",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "What to expect in the Zomato system design interview (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-to-expect-in-the-zomato-system-design-interview",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45 to 60 minutes (guide figure)",
        variesBy: "One guide attributes it to experienced candidates; the other names no level.",
      },
      {
        name: "HR conversation",
        type: "hr",
        format:
          "Short chat of about 15 minutes in both campus reports. In the FTE report no questions were asked and the interviewers described the working culture; the SDE-1 report only calls it a quick HR chat.",
        tested: ["company culture overview"],
        grade: "one",
        sources: [
          {
            label: "Zomato SDE-1 on-campus 2023 (GeeksforGeeks)",
            url: "https://geeksforgeeks.org/zomato-interview-experience-for-sde-1-on-campus-2023",
            kind: "candidate-report",
            year: 2023,
          },
          {
            label: "Zomato FTE on-campus 2023 (GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=1140290",
            kind: "candidate-report",
            year: 2023,
          },
        ],
        duration: "About 15 minutes (campus reports)",
      },
    ],
    gaps: "LeetCode, Naukri Code360, Glassdoor, Medium and Dataford returned 403/429, so 2025-26 SDE-2 and SDE-1 off-campus reports were seen only as search snippets and are excluded. The readable first-hand pages are two 2023 campus posts and one in-person loop (interview date not stated, page updated July 2023) that does not match the campus pattern; rounds for later levels rest on prep guides only. Prep-guide years are page-footer copyright dates, and one guide's title and heading disagree on the year. No dedicated machine-coding round found.",
  },
  {
    company: "cred",
    summary:
      "Readable sources describe an online coding test, a timed machine-coding build graded on clean object-oriented design, a DSA interview, a design interview, and a manager round. Evidence is thin: one candidate account (via a secondary write-up) plus generic guides.",
    rounds: [
      {
        name: "Online coding test",
        type: "oa",
        format:
          "Proctored HackerRank test with three problems in one guide; another guide says two to three medium-to-hard problems, sometimes with MCQs. One campus report in a guide has about 200 test takers and about 20 advancing.",
        tested: ["greedy reasoning", "bitmask DP", "combinatorics"],
        grade: "guide",
        sources: [
          {
            label: "CRED interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-cred-interview-process-like-round-by-round",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "CRED interview experience (PlacementPapers)",
            url: "https://placementpapers.app/cred/interview-experience/",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "90 to 105 minutes",
        variesBy:
          "One campus report in a guide describes a CGPA eligibility filter before the test; the other guide lists CGPA cutoffs as eligibility without tying them to the test.",
      },
      {
        name: "Machine coding round",
        type: "machine-coding",
        format:
          "Build a working program within a fixed window, then have it reviewed. The 2024 SDE-2 account describes a Java payment-processing package judged on design patterns, error handling and test coverage; a guide adds that running code, class structure and ease of adding requirements are judged. Durations differ between sources.",
        tested: ["object-oriented design", "design patterns", "error handling", "unit tests", "extensibility"],
        grade: "one",
        sources: [
          {
            label: "CRED SDE-2 Bangalore 2024 offer write-up (PapersAdda, retelling a Medium post)",
            url: "https://papersadda.com/article/cred-sde2-bangalore-2024-payment-processor-offer/",
            kind: "candidate-report",
            year: 2024,
          },
          {
            label: "CRED interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-cred-interview-process-like-round-by-round",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration:
          "90 minutes in the 2024 SDE-2 account (60 minutes plus a 30-minute extension); about 150 minutes in a guide",
        variesBy: "The only candidate account read is an SDE-2 loop from July 2024.",
      },
      {
        name: "DSA interview",
        type: "dsa",
        format:
          "Two medium problems framed practically; the 2024 SDE-2 candidate called it an onsite round and the easiest stage. A guide describes video rounds where problems may be talked through rather than fully coded.",
        tested: ["sliding window", "hash maps and sets", "heaps", "explaining trade-offs"],
        grade: "one",
        sources: [
          {
            label: "CRED SDE-2 Bangalore 2024 offer write-up (PapersAdda, retelling a Medium post)",
            url: "https://papersadda.com/article/cred-sde2-bangalore-2024-payment-processor-offer/",
            kind: "candidate-report",
            year: 2024,
          },
          {
            label: "CRED interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-cred-interview-process-like-round-by-round",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "45 to 90 minutes depending on source",
      },
      {
        name: "System design (low-level design at lower levels)",
        type: "hld",
        format:
          "The 2024 SDE-2 account describes a Dropbox-like design where the interviewer kept adding constraints. A guide says this second technical interview is low-level design, or system design at senior levels.",
        tested: ["system design", "low-level design", "handling added constraints", "fault tolerance"],
        grade: "one",
        sources: [
          {
            label: "CRED SDE-2 Bangalore 2024 offer write-up (PapersAdda, retelling a Medium post)",
            url: "https://papersadda.com/article/cred-sde2-bangalore-2024-payment-processor-offer/",
            kind: "candidate-report",
            year: 2024,
          },
          {
            label: "CRED interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-cred-interview-process-like-round-by-round",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "About 60 minutes in the SDE-2 account",
        variesBy:
          "Per a guide, senior levels get system design and lower levels get low-level design; the guide gives no level thresholds.",
      },
      {
        name: "Hiring manager round",
        type: "manager",
        format:
          "Past-project deep dive, behavioral questions, and in the 2024 SDE-2 account a lighter design problem. A guide adds schema design and failure handling can appear.",
        tested: ["project depth", "ownership and teamwork", "behavioral answers", "light design"],
        grade: "one",
        sources: [
          {
            label: "CRED SDE-2 Bangalore 2024 offer write-up (PapersAdda, retelling a Medium post)",
            url: "https://papersadda.com/article/cred-sde2-bangalore-2024-payment-processor-offer/",
            kind: "candidate-report",
            year: 2024,
          },
          {
            label: "CRED interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-cred-interview-process-like-round-by-round",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "About 60 minutes (SDE-2 account); 45 minutes in another guide",
      },
      {
        name: "HR round",
        type: "hr",
        format:
          "General conversation on motivation, integrity and relocation, per one unsourced guide. No candidate account of it was read.",
        tested: ["motivation", "culture fit", "relocation"],
        grade: "guide",
        sources: [
          {
            label: "CRED interview experience (PlacementPapers)",
            url: "https://placementpapers.app/cred/interview-experience/",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "20 to 30 minutes (one guide)",
      },
    ],
    typicalWeeks: "2-3 weeks (one guide's estimate)",
    gaps: "No specific CRED coding (DSA) problems could be verified: LeetCode, Naukri Code360 and Medium returned 403, so several 2021-2025 candidate reports seen in search results are excluded. The single candidate account is a secondary retelling (PapersAdda, 2026) of a Dec 2024 Medium post about a July 2024 SDE-2 loop. No SDE-1 or SDE-3 specifics, no SQL questions.",
  },
  {
    company: "meesho",
    summary:
      "Readable reports describe a timed online test, live coding interviews, a machine-coding or low-level-design build, and, in one SDE-3 report, a high-level design round. Campus SDE-1 loops lean on DSA plus fundamentals; backend and SDE-3 loops add machine coding.",
    rounds: [
      {
        name: "Online test with coding and MCQs",
        type: "oa",
        format:
          "Three coding problems (two easy, one medium) plus 20 easy-to-medium MCQs on OS, networks, C/C++ and Java. Only a small group advanced to interviews.",
        tested: ["arrays and strings", "dynamic programming with binary search", "OS and networks MCQs"],
        grade: "one",
        sources: [
          {
            label: "Meesho SDE-1 on-campus virtual (GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=571093",
            kind: "candidate-report",
            year: 2025,
          },
        ],
        variesBy: "Reported for campus SDE-1 hiring only.",
      },
      {
        name: "Live coding interview",
        type: "dsa",
        format:
          "Campus report: live coding on HackerRank CodePair after a resume walkthrough, with one very easy and one harder problem that had to pass all test cases, then OS and DB questions. Backend report: a technical round built around one dynamic-programming problem with 14 test cases; its format is not stated.",
        tested: ["greedy", "dynamic programming", "resume projects", "OS and DBMS basics"],
        grade: "several",
        sources: [
          {
            label: "Meesho SDE-1 on-campus virtual (GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=571093",
            kind: "candidate-report",
            year: 2025,
          },
          {
            label: "Meesho software engineer backend (GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=1105262",
            kind: "candidate-report",
            year: 2024,
          },
        ],
        duration: "Scheduled for 1.5 hours (campus report)",
        variesBy: "Campus SDE-1 versus a backend candidate with 2+ years.",
      },
      {
        name: "Machine coding / low-level design",
        type: "machine-coding",
        format:
          "Build working features for a small product, such as a ride-sharing app or an inventory service. The SDE-3 report included a payment-flow simulation; one backend candidate finished only one of two features.",
        tested: ["object-oriented design", "working code under time pressure", "feature completeness"],
        grade: "several",
        sources: [
          {
            label: "Meesho software engineer backend (GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=1105262",
            kind: "candidate-report",
            year: 2024,
          },
          {
            label: "Meesho interview process thread, SDE 3 (Blind)",
            url: "https://www.teamblind.com/post/meesho-interview-process-ktfe0jyu",
            kind: "candidate-report",
            year: 2024,
          },
        ],
        duration: "120 minutes (SDE-3 report)",
        variesBy: "Seen in backend (2+ years) and SDE-3 reports, not in the campus SDE-1 report.",
      },
      {
        name: "High-level design round",
        type: "hld",
        format:
          "One SDE-3 candidate was asked to design a Google Drive-like system with shared folders and cross-device sync, and was rejected after this round.",
        tested: ["system design", "data sync", "sharing model"],
        grade: "one",
        sources: [
          {
            label: "Meesho interview process thread, SDE 3 (Blind)",
            url: "https://www.teamblind.com/post/meesho-interview-process-ktfe0jyu",
            kind: "candidate-report",
            year: 2024,
          },
        ],
        duration: "90 minutes",
        variesBy: "Senior-level report only.",
      },
      {
        name: "Second technical: projects, DB and CS",
        type: "cs",
        format:
          "Role in a team project, its database tables and SQL queries, one DFS-based coding problem, then networking, OS and DBMS questions.",
        tested: ["project design", "SQL", "networking", "operating systems", "DBMS"],
        grade: "one",
        sources: [
          {
            label: "Meesho SDE-1 on-campus virtual (GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=571093",
            kind: "candidate-report",
            year: 2025,
          },
        ],
        duration: "About 1 hour",
        variesBy: "Campus SDE-1 report.",
      },
      {
        name: "HR round",
        type: "hr",
        format: "Described by the one campus candidate as a formality with no questions asked.",
        tested: ["none reported"],
        grade: "one",
        sources: [
          {
            label: "Meesho SDE-1 on-campus virtual (GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=571093",
            kind: "candidate-report",
            year: 2025,
          },
        ],
      },
    ],
    gaps: "Only three Meesho pages were readable (two GeeksforGeeks posts and one Blind thread). GeeksforGeeks pages show only last-updated dates (2024, 2025), not interview years, and neither labels the level beyond campus SDE-1 or 2+ years. LeetCode, Naukri Code360, Glassdoor and Interview Query returned 403/429/timeouts, so SDE-2 DSA and hiring-manager rounds are unverified.",
  },
  {
    company: "groww",
    summary:
      "Groww does not publish its process; guides that cite unnamed candidate reports describe a loop of about four to five rounds with DSA, a machine coding round, a system design round (in two of the three guides) and a hiring manager chat. One guide says campus hiring is shorter, with no machine coding or system design.",
    rounds: [
      {
        name: "Online assessment",
        type: "oa",
        format:
          "Timed remote test. One 2020 campus report had nine MCQs plus one coding problem; a guide describes MCQs plus one or two coding problems.",
        tested: ["time complexity", "OS and threading basics", "C++ basics", "one DP-style coding problem"],
        grade: "one",
        sources: [
          {
            label: "Groww SDE campus experience (GfG, Aug 2020)",
            url: "https://www.geeksforgeeks.org/interview-experiences/groww-software-development-engineer-interview-experience/",
            kind: "candidate-report",
            year: 2020,
          },
          {
            label: "CodeKerdos: Groww SDE-1 breakdown",
            url: "https://blog.codekerdos.in/groww-sde-1-interview-a-complete-breakdown/",
            kind: "prep-guide",
          },
          {
            label: "Groww interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-groww-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
        ],
        duration: "about 60-90 min (one guide)",
        variesBy:
          "Campus candidates report an aptitude plus technical test; 2026 guide also mentions a debugging exercise.",
      },
      {
        name: "DSA / problem-solving round(s)",
        type: "dsa",
        format:
          "Problem solving in one or two rounds of about an hour each per guides, with about two main problems in one guide. The 2020 campus report asked for loop detection and next greater element, a knight-moves problem in a second round, and two logic puzzles. Guides list topics such as graphs, BST, DP and sliding window.",
        tested: ["data structures", "DP and graphs", "complexity analysis", "logic puzzles"],
        grade: "one",
        sources: [
          {
            label: "Groww SDE campus experience (GfG, Aug 2020)",
            url: "https://www.geeksforgeeks.org/interview-experiences/groww-software-development-engineer-interview-experience/",
            kind: "candidate-report",
            year: 2020,
          },
          {
            label: "CodeKerdos: Groww SDE-1 breakdown",
            url: "https://blog.codekerdos.in/groww-sde-1-interview-a-complete-breakdown/",
            kind: "prep-guide",
          },
          {
            label: "Groww interview questions and process (Greenroom, 2026)",
            url: "https://usegreenroom.app/blog/groww-interview-questions",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 60 min each (guides)",
        variesBy:
          "Experienced hires report one or two rounds; the 2020 campus report had a DS round, a DP/graph round and a short managerial chat.",
      },
      {
        name: "Machine coding round",
        type: "machine-coding",
        format:
          "Build a working, modular program from a problem statement, then extend it live. Judged on object modelling, working code and explaining choices. Reported mainly for experienced hires.",
        tested: [
          "object-oriented modelling",
          "working end-to-end code",
          "extensibility",
          "talking through design while coding",
        ],
        grade: "guide",
        sources: [
          {
            label: "Groww interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-groww-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
          {
            label: "CodeKerdos: Groww SDE-1 breakdown",
            url: "https://blog.codekerdos.in/groww-sde-1-interview-a-complete-breakdown/",
            kind: "prep-guide",
          },
          {
            label: "Groww interview questions and process (Greenroom, 2026)",
            url: "https://usegreenroom.app/blog/groww-interview-questions",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "60 to 120 minutes depending on the guide",
        variesBy: "Reported for experienced hires; no machine coding reported in the campus path (one guide).",
      },
      {
        name: "System design round",
        type: "hld",
        format:
          "Design discussion; one guide stresses reliability and consistency of investment, order and portfolio data, another names stock-market systems, caching and subscription-based API access.",
        tested: ["reliability and consistency", "caching", "stock-market systems"],
        grade: "guide",
        sources: [
          {
            label: "Groww interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-groww-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
          {
            label: "Groww interview questions and process (Greenroom, 2026)",
            url: "https://usegreenroom.app/blog/groww-interview-questions",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 60 min (one guide)",
        variesBy: "Experienced hires only in the sources read.",
      },
      {
        name: "Hiring manager round",
        type: "manager",
        format:
          "Project deep dive, ownership, reason for moving, behavioural scenarios and compensation. Sometimes a small design or DSA puzzle at the end.",
        tested: ["project depth", "ownership", "culture fit"],
        grade: "guide",
        sources: [
          {
            label: "Groww interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-groww-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
          {
            label: "CodeKerdos: Groww SDE-1 breakdown",
            url: "https://blog.codekerdos.in/groww-sde-1-interview-a-complete-breakdown/",
            kind: "prep-guide",
          },
        ],
        duration: "30-60 min (guides); one report says about 15 min",
      },
    ],
    gaps: "LeetCode Discuss (SDE-2 2022/2024, SDE-3 and April 2025 reports), Naukri Code360 and Glassdoor returned 403, so first-hand 2022+ experiences could not be read or cited. All Groww sources read are either a 2020 campus report, an undated internship report, or prep guides without named reports. Round durations come from guides, not candidates. No Groww SQL or HR specifics verified.",
  },
  {
    company: "paytm",
    summary:
      "Paytm's reported process is an online coding test followed by one or two DSA-and-fundamentals technical interviews, with a design round added for SDE-2 and above, then a manager and HR conversation. One guide says the number of rounds depends on seniority and team.",
    rounds: [
      {
        name: "Online assessment",
        type: "oa",
        format:
          "Timed coding test, three DSA problems in the 2021 campus drives; a 2026 guide adds SQL and Java MCQs on HackerRank or CoCubes.",
        tested: ["array and linked-list problems", "DP and number theory", "DFS on grids", "speed under time limit"],
        grade: "one",
        sources: [
          {
            label: "Paytm SDE on-campus 2021 (GfG)",
            url: "https://www.geeksforgeeks.org/?p=685099",
            kind: "candidate-report",
            year: 2021,
          },
          {
            label: "Paytm SDE on-campus 2021 (GfG)",
            url: "https://www.geeksforgeeks.org/?p=674864",
            kind: "candidate-report",
            year: 2021,
          },
          {
            label: "Paytm interview process (TechPrep, 2026)",
            url: "https://www.techprep.app/blog/paytm-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "70 min (2021 campus); 90-120 min (2026 guide)",
        variesBy: "Campus drives had 3 coding questions; senior referral report mentions an online test on HackerRank.",
      },
      {
        name: "Technical round 1: DSA and fundamentals",
        type: "dsa",
        format:
          "Live coding of one or two algorithm problems in a shared editor or doc, plus core CS (Java, OS, DBMS, OOP) and resume discussion.",
        tested: [
          "linked lists, trees, arrays",
          "brute force to optimised reasoning",
          "OS and DBMS fundamentals",
          "language basics",
        ],
        grade: "several",
        sources: [
          {
            label: "Paytm SDE on-campus 2021 (GfG)",
            url: "https://www.geeksforgeeks.org/?p=685099",
            kind: "candidate-report",
            year: 2021,
          },
          {
            label: "Paytm SDE on-campus (GfG)",
            url: "https://www.geeksforgeeks.org/?p=679857",
            kind: "candidate-report",
          },
          {
            label: "Paytm interview process (TechPrep, 2026)",
            url: "https://www.techprep.app/blog/paytm-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 60 min",
        variesBy:
          "Campus reports differ: one adds SQL questions, another combines technical and HR questions over about two hours.",
      },
      {
        name: "Technical round 2: advanced stack, coding or LLD",
        type: "machine-coding",
        format:
          "Further coding plus stack depth (Java/Spring for backend) or a machine coding exercise; a 2025 senior report ended with a low-level design and projects round.",
        tested: [
          "coding and optimisation",
          "backend stack depth (Java, Spring Boot, JVM, Kafka)",
          "machine coding",
          "low-level design",
          "project depth",
        ],
        grade: "guide",
        sources: [
          {
            label: "Paytm interview process (TechPrep, 2026)",
            url: "https://www.techprep.app/blog/paytm-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Paytm interview questions and experience (PlacementPreparation, Oct 2025)",
            url: "https://www.placementpreparation.io/blog/paytm-interview-questions-and-experience/",
            kind: "prep-guide",
            year: 2025,
          },
          {
            label: "Paytm SDE on-campus 2021 (GfG)",
            url: "https://www.geeksforgeeks.org/?p=685099",
            kind: "candidate-report",
            year: 2021,
          },
        ],
        duration: "about 45 min (2021 campus)",
        variesBy:
          "Campus: coding and CS. A 2025 frontend senior referral report (summarised by a guide) ended with a low-level design and projects round and was rejected, with feedback to work on design patterns and optimisation.",
      },
      {
        name: "System design round",
        type: "hld",
        format:
          "More common for SDE-2 and senior roles: fintech architecture such as a UPI payment flow or fraud detection. One guide files wallet design and hotel booking under a separate low-level-design round. Idempotency and consistency are stressed.",
        tested: [
          "payment flow design",
          "idempotency and consistency",
          "transaction integrity",
          "partial failures and race conditions",
        ],
        grade: "guide",
        sources: [
          {
            label: "Paytm interview process (TechPrep, 2026)",
            url: "https://www.techprep.app/blog/paytm-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Paytm interview questions and experience (PlacementPreparation, Oct 2025)",
            url: "https://www.placementpreparation.io/blog/paytm-interview-questions-and-experience/",
            kind: "prep-guide",
            year: 2025,
          },
        ],
        variesBy: "More common for SDE-2 and senior roles; the campus reports read do not describe it.",
      },
      {
        name: "Managerial and team fit",
        type: "manager",
        format:
          "Conversation with an engineering manager about past projects, handling technical challenges and working with a team.",
        tested: ["project ownership", "team collaboration", "handling technical challenges"],
        grade: "guide",
        sources: [
          {
            label: "Paytm interview process (TechPrep, 2026)",
            url: "https://www.techprep.app/blog/paytm-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
          {
            label: "Paytm interview questions and experience (PlacementPreparation, Oct 2025)",
            url: "https://www.placementpreparation.io/blog/paytm-interview-questions-and-experience/",
            kind: "prep-guide",
            year: 2025,
          },
        ],
      },
      {
        name: "HR round",
        type: "hr",
        format:
          "One campus report asks why Paytm and about strengths and weaknesses; a guide adds compensation expectations and logistics. Two other campus reports describe no separate HR round.",
        tested: ["motivation", "self-awareness", "logistics and expectations"],
        grade: "one",
        sources: [
          {
            label: "Paytm SDE on-campus (GfG)",
            url: "https://www.geeksforgeeks.org/?p=679857",
            kind: "candidate-report",
          },
          {
            label: "Paytm interview process (TechPrep, 2026)",
            url: "https://www.techprep.app/blog/paytm-interview-process",
            kind: "prep-guide",
            year: 2026,
          },
        ],
      },
    ],
    typicalWeeks: "2-4",
    gaps: "Could not read LeetCode Discuss (SDE-2 F2F, SDE-1) or Naukri Code360 (403), nor the Medium reports cited by one guide, so no first-hand 2022+ SDE-1/SDE-2 report was verified. All first-hand reads are campus reports: two titled 2021 (the year is not in the body) and one with only a 2025 page-update date. A 2025 guide's fresher and senior accounts are summaries of Medium posts. Round durations beyond the 2021 campus drive come from guides. SDE-3 not covered.",
  },
  {
    company: "zerodha",
    summary:
      "One guide describes Zerodha's engineering hiring as a recruiter call, a small practical task, one to three technical conversations that start from your own projects, and a final fit conversation. First-person engineering reports are scarce, so everything here is secondary and rests mainly on that one guide.",
    rounds: [
      {
        name: "Recruiter call",
        type: "hr",
        format:
          "Call covering background, reason for applying and notice period; a second guide describes an HR or recruiter screen on role fit, location and salary.",
        tested: ["background fit", "motivation", "notice period"],
        grade: "guide",
        sources: [
          {
            label: "Zerodha interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-zerodha-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
          {
            label: "Zerodha interview process (Hyring, 2026)",
            url: "https://hyring.com/jobseeker-toolkit/interview-questions/company/zerodha",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        duration: "about 30 min",
      },
      {
        name: "Practical task",
        type: "take-home",
        format:
          "A small program written on your own time and submitted with a README. Judged on whether it runs, how it is organised and how you explain choices. A guide cites a CSV-processing sample.",
        tested: ["working code", "code organisation", "written explanation", "data processing"],
        grade: "guide",
        sources: [
          {
            label: "Zerodha interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-zerodha-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
          {
            label: "Zerodha interview process (Hyring, 2026)",
            url: "https://hyring.com/jobseeker-toolkit/interview-questions/company/zerodha",
            kind: "prep-guide",
            year: 2026,
          },
        ],
        variesBy:
          "One guide describes it for engineering candidates and says an online test appears only in third-party guides, unconfirmed; the other guide describes role-dependent tasks such as support scenarios or data cases.",
      },
      {
        name: "Technical conversations",
        type: "domain",
        format:
          "One to three video or in-person sessions that start from your resume projects, then cover your daily language, relational databases and how systems behave under load. The guide notes that Zerodha runs Go services and large PostgreSQL deployments.",
        tested: ["project depth", "relational databases", "backend language fluency", "system behavior under load"],
        grade: "guide",
        sources: [
          {
            label: "Zerodha interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-zerodha-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
        ],
        variesBy: "Guide says some candidates report two technical conversations, others four or five stages in total.",
      },
      {
        name: "Final fit conversation",
        type: "manager",
        format:
          "Video or in person, on working style and expectations; interviewers reportedly explain that much of the work is routine data processing shaped by regulation.",
        tested: ["working style", "expectation alignment", "motivation"],
        grade: "guide",
        sources: [
          {
            label: "Zerodha interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-zerodha-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
        ],
      },
    ],
    typicalWeeks: "a few weeks (guide)",
    gaps: "No first-hand Zerodha engineering report could be read: the Feb 2024 LeetCode backend post (stages: CTO resume talk, DSA, system design, behavioural; ghosted) returned 403 so it is not cited. Prepfully and InterviewPal pages contained no engineering rounds or questions. No coding (DSA) questions are verified. Durations other than the recruiter call are unknown. The second guide (Hyring) describes role tasks and a manager, HR and offer stage and does not mention Go, PostgreSQL or the CSV task, so the engineering details rest on the first guide alone.",
  },
  {
    company: "ola",
    summary:
      "Readable evidence is thin: no readable page states its interview date, and the pages were last updated in 2021 or 2025. Reports describe a coding test or DSA rounds, a design or OOP round, a hiring-manager conversation and sometimes HR; the exact mix depends on level, team and year.",
    rounds: [
      {
        name: "Online coding assessment",
        type: "oa",
        format:
          "Timed online coding test with three problems, 90 minutes in both reports. The campus report calls all three mandatory (an easy string problem, a medium array problem and a knapsack variant); the SDE-2 report names HackerRank.",
        tested: ["arrays and strings", "dynamic programming", "binary-string flips", "budgeted selection"],
        grade: "one",
        sources: [
          {
            label: "GfG: Ola Electric SDE on-campus (interview date not stated, page updated 2025)",
            url: "https://www.geeksforgeeks.org/?p=751319",
            kind: "candidate-report",
          },
          {
            label: "GfG: Ola SDE-2 experienced (interview date not stated, page updated 2025)",
            url: "https://www.geeksforgeeks.org/interview-experiences/ola-interview-experience-for-experienced-sde-2/",
            kind: "candidate-report",
          },
        ],
        duration: "90 minutes (two reports)",
        variesBy: "Campus SDE and experienced SDE-2 both reported it; not seen in the 2021 SDE-1 or SDE-2 posts.",
      },
      {
        name: "Technical coding rounds",
        type: "dsa",
        format:
          "One to three live coding rounds. The SDE-1 report (page updated 2021) had three rounds on screen share where interviewers wanted the approach explained before code; the campus report had one Zoom round with two medium-hard problems; the SDE-2 report had a one-hour face-to-face round.",
        tested: [
          "heaps and k-way merge",
          "recursion and permutations",
          "trees and graphs",
          "design of data-structure variants (LRU, min/max stack)",
        ],
        grade: "one",
        sources: [
          {
            label: "GfG: Ola Electric SDE on-campus (interview date not stated, page updated 2025)",
            url: "https://www.geeksforgeeks.org/?p=751319",
            kind: "candidate-report",
          },
          {
            label: "GfG: Ola SDE-2 experienced (interview date not stated, page updated 2025)",
            url: "https://www.geeksforgeeks.org/interview-experiences/ola-interview-experience-for-experienced-sde-2/",
            kind: "candidate-report",
          },
          {
            label: "GfG: Ola SDE-2 (page updated 2021, older than 2022)",
            url: "https://www.geeksforgeeks.org/ola-interview-experience-for-sde-2/",
            kind: "candidate-report",
            year: 2021,
          },
          {
            label: "GfG: Ola SDE-1, 1 year experience (page updated 2021, older than 2022)",
            url: "https://www.geeksforgeeks.org/ola-interview-experience-1-year-experienced/",
            kind: "candidate-report",
            year: 2021,
          },
        ],
        duration: "40-60 minutes each where stated",
        variesBy: "SDE-1 reports show more coding rounds; SDE-2 reports mix coding with design.",
      },
      {
        name: "Machine coding / OOP design",
        type: "machine-coding",
        format:
          "Build a small library or object model in code: a Java logging library with pluggable outputs in one report, an OOP bowling game as a one-hour written test in another. In the logging report the next round discussed the design and concurrency.",
        tested: ["object-oriented design", "extensibility and configuration", "concurrency handling", "code quality"],
        grade: "one",
        sources: [
          {
            label: "GfG: Ola Cabs SDE-2 Set 4 (interview date not stated, page updated 2025)",
            url: "https://geeksforgeeks.org/ola-cabs-interview-experience-set-4-for-sde-2",
            kind: "candidate-report",
          },
          {
            label: "GfG: Ola Cabs Bangalore SDE (interview date not stated, page updated 2025)",
            url: "https://www.geeksforgeeks.org/?p=133914",
            kind: "candidate-report",
          },
        ],
        duration: "about 1 hour",
        variesBy:
          "Logging library reported by an SDE-2 candidate; the bowling game by an SDE candidate with no stated interview date. Not seen in the other Ola pages read.",
      },
      {
        name: "High-level design discussion",
        type: "hld",
        format:
          "The SDE-2 post (updated 2021) pairs a resume deep-dive with a Spotify-like music streaming design. The Set 4 post lists application monitoring, a city-limit check that shows available cabs, and an array-sorting problem in a one-hour round, without saying they were design discussions.",
        tested: ["resume depth", "service design", "point-in-area check", "handling data from many applications"],
        grade: "one",
        sources: [
          {
            label: "GfG: Ola SDE-2 (page updated 2021, older than 2022)",
            url: "https://www.geeksforgeeks.org/ola-interview-experience-for-sde-2/",
            kind: "candidate-report",
            year: 2021,
          },
          {
            label: "GfG: Ola Cabs SDE-2 Set 4 (interview date not stated, page updated 2025)",
            url: "https://geeksforgeeks.org/ola-cabs-interview-experience-set-4-for-sde-2",
            kind: "candidate-report",
          },
        ],
        duration: "1 hour (Set 4 round)",
        variesBy: "SDE-2 reports; none in the SDE-1 reports read.",
      },
      {
        name: "Hiring manager round",
        type: "manager",
        format:
          "Reports agree on project and motivation questions (why leave, why Ola or a startup). Two add technical probes on scaling, caching, SQL vs NoSQL and HTTP methods; the Set 4 report had none.",
        tested: [
          "project ownership",
          "scaling and caching concepts",
          "motivation for a startup",
          "SQL vs NoSQL, HTTP basics",
        ],
        grade: "one",
        sources: [
          {
            label: "GfG: Ola Cabs SDE-2 Set 4 (interview date not stated, page updated 2025)",
            url: "https://geeksforgeeks.org/ola-cabs-interview-experience-set-4-for-sde-2",
            kind: "candidate-report",
          },
          {
            label: "GfG: Ola SDE-2 (page updated 2021, older than 2022)",
            url: "https://www.geeksforgeeks.org/ola-interview-experience-for-sde-2/",
            kind: "candidate-report",
            year: 2021,
          },
          {
            label: "GfG: Ola SDE-1, 1 year experience (page updated 2021, older than 2022)",
            url: "https://www.geeksforgeeks.org/ola-interview-experience-1-year-experienced/",
            kind: "candidate-report",
            year: 2021,
          },
          {
            label: "GfG: Ola Cabs Bangalore SDE (interview date not stated, page updated 2025)",
            url: "https://www.geeksforgeeks.org/?p=133914",
            kind: "candidate-report",
          },
        ],
        duration: "45 minutes (two reports)",
        variesBy: "Technical content was heavier in the SDE-2 and 1-year-experienced reports.",
      },
      {
        name: "HR round",
        type: "hr",
        format:
          "20-minute Zoom video chat on knowledge of Ola, an issue faced with Ola Cabs and how a developer would fix it, projects, remote-internship challenges and comfort with the office location.",
        tested: ["company awareness", "projects", "culture and logistics fit"],
        grade: "one",
        sources: [
          {
            label: "GfG: Ola Electric SDE on-campus (interview date not stated, page updated 2025)",
            url: "https://www.geeksforgeeks.org/?p=751319",
            kind: "candidate-report",
          },
        ],
        duration: "20 minutes (one campus report)",
        variesBy: "Campus hiring report only.",
      },
    ],
    gaps: "LeetCode, Naukri Code360 and Glassdoor returned 403 or only showed in search snippets, so newer reports (for example 2024-2025 SDE-1 and SDE-2 with LRU cache, load balancer, URL shortener, rate limiter) could not be cited. The GfG pages give 'last updated' dates, not interview dates, so no Ola round could be confirmed with a 2022+ interview date and every round is graded one at most. Ola Electric and Ola Cabs are not always distinguished in the reports. No official process page found.",
  },
  {
    company: "dream11",
    summary:
      "The only fully readable Dream11 report is one 2024 SDE-2 loop: a coding screen, a database and project round, an on-site high-level design in Mumbai and a hiring-manager round. Other reports exist on sites I could not open.",
    rounds: [
      {
        name: "Virtual coding round",
        type: "dsa",
        format:
          "Virtual round on 29 March 2024: two problems (minimum path sum in a grid, first missing positive in O(n) time and O(1) space) written in a text editor, dry-run on test cases, with time and space complexity explained.",
        tested: ["grid dynamic programming", "array in-place tricks", "complexity reasoning"],
        grade: "one",
        sources: [
          {
            label: "GfG: Dream11 SDE-2 interview experience (interviews Mar-Apr 2024)",
            url: "https://www.geeksforgeeks.org/interview-experiences/dream11-interview-experience-for-sde-2/",
            kind: "candidate-report",
            year: 2024,
          },
        ],
        variesBy: "SDE-2 only in the readable source.",
      },
      {
        name: "Database and project discussion",
        type: "cs",
        format:
          "Candidate walked through a past project's architecture and schema on a diagram tool, then answered database questions tied to that stack.",
        tested: [
          "isolation levels",
          "pessimistic vs optimistic locking",
          "indexing",
          "CDN and load balancer rationale",
        ],
        grade: "one",
        sources: [
          {
            label: "GfG: Dream11 SDE-2 interview experience (interviews Mar-Apr 2024)",
            url: "https://www.geeksforgeeks.org/interview-experiences/dream11-interview-experience-for-sde-2/",
            kind: "candidate-report",
            year: 2024,
          },
        ],
        variesBy: "SDE-2; questions followed the candidate's own stack.",
      },
      {
        name: "On-site high-level design (Mumbai)",
        type: "hld",
        format:
          "On-site on 27 April 2024. Opened with questions on technologies from the resume, including Redis list internals and change data capture, then one design problem: send lineup notifications to users 30 minutes before a match, fed by two Kafka streams, scaling from 1,000 to millions of users. Flights were arranged by the company.",
        tested: [
          "Redis and stream processing",
          "change data capture",
          "scaling to millions of users",
          "reasoning behind choices",
        ],
        grade: "one",
        sources: [
          {
            label: "GfG: Dream11 SDE-2 interview experience (interviews Mar-Apr 2024)",
            url: "https://www.geeksforgeeks.org/interview-experiences/dream11-interview-experience-for-sde-2/",
            kind: "candidate-report",
            year: 2024,
          },
          {
            label: "DesignGurus: what to expect in Dream11 system design (course-vendor summary of candidate reports)",
            url: "https://www.designgurus.io/answers/detail/what-to-expect-in-the-dream11-system-design-interview",
            kind: "prep-guide",
          },
        ],
        variesBy: "SDE-2 on-site; prep guide says frontend and backend tracks differ.",
      },
      {
        name: "Hiring manager round",
        type: "manager",
        format:
          "Conversation on hiring philosophy, past failures and disagreements, payment-system work, and how services are monitored.",
        tested: ["ownership and judgment", "monitoring and availability metrics", "self-reflection on feedback"],
        grade: "one",
        sources: [
          {
            label: "GfG: Dream11 SDE-2 interview experience (interviews Mar-Apr 2024)",
            url: "https://www.geeksforgeeks.org/interview-experiences/dream11-interview-experience-for-sde-2/",
            kind: "candidate-report",
            year: 2024,
          },
        ],
        variesBy:
          "Reported for SDE-2; the candidate was not selected overall, and the page does not give this round's own result.",
      },
    ],
    typicalWeeks:
      "About four weeks from the first coding round (29 March) to the on-site design round (27 April) in the one readable report; the hiring-manager round date is not stated.",
    gaps: "LeetCode, Naukri, Glassdoor, Medium, the hritik.me post and interviewexperiences.in were not readable (403, TLS error or truncated previews), so I could not cite them even though search results mention SDE-1 (Nov 2024), SDE-2 backend (Feb 2025) and frontend loops, a Postgres database round, and a monitoring-system design prompt. The two GfG posts look like the same candidate, so counted as one source. No official process page and no round durations. DesignGurus mentions object-level design inside the backend project round and a timed machine-coding round for the frontend track, without durations or details.",
  },
  {
    company: "juspay",
    summary:
      "Juspay's reported process is unusual: a graph-heavy online test, then a multi-hour hackathon on one problem that is first solved and then made concurrent, followed by long technical and founder conversations. Only one readable page gives an interview date (a June 2021 campus drive); the others are undated, and one mentions remote hiring because of the pandemic. No recent SDE-2/3 detail was readable.",
    rounds: [
      {
        name: "Online coding test",
        type: "oa",
        format:
          "Timed online test with three graph-based problems in both reports (two easier and one medium-hard in the SDE-1 report, medium-hard in the intern report). In the SDE-1 report it is the first filter before the hackathon.",
        tested: ["graph algorithms"],
        grade: "one",
        sources: [
          {
            label: "Juspay SDE-1 interview experience via HackerEarth (undated, GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=447763",
            kind: "candidate-report",
          },
          {
            label: "Juspay Internship Interview Experience (undated, GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=671552",
            kind: "candidate-report",
          },
        ],
        duration: "About 1.5 hours (intern report)",
        variesBy: "Reports are SDE-1 (about 1 year experience) and intern/campus; senior-level OA format not found.",
      },
      {
        name: "Hackathon Part A",
        type: "machine-coding",
        format:
          "Remote. One problem that is mainly algorithmic with a low-level-design flavour. The candidate discusses an approach with a panel of five, then codes it on a shared editor (codeshare). About 20 candidates nationwide were picked, and a founder gave an orientation.",
        tested: ["problem decomposition", "low-level design", "working code under time"],
        grade: "one",
        sources: [
          {
            label: "Juspay SDE-1 interview experience via HackerEarth (undated, GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=447763",
            kind: "candidate-report",
          },
          {
            label: "Juspay Internship Interview Experience (undated, GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=671552",
            kind: "candidate-report",
          },
        ],
        duration: "Within 2 hours (SDE-1 report)",
        variesBy:
          "The intern report instead has a 3-hour HackerEarth challenge called Tree of Space, whose problem is not described.",
      },
      {
        name: "Hackathon Part B (concurrency and scale)",
        type: "machine-coding",
        format:
          "The same problem is extended for concurrency and scalability. Candidate proposes approaches, discusses with interviewers, then codes the chosen one in a shared editor.",
        tested: ["multithreading concepts", "scalability", "extending existing code"],
        grade: "one",
        sources: [
          {
            label: "Juspay SDE-1 interview experience via HackerEarth (undated, GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=447763",
            kind: "candidate-report",
          },
        ],
      },
      {
        name: "Technical interview (2 interviewers)",
        type: "dsa",
        format:
          "Two interviewers, held shortly after the hackathon. Covers your projects, an open-ended requirements-to-code problem that became a dynamic programming task, a second algorithm problem with brute force to optimal, and deep networking questions.",
        tested: ["project depth", "dynamic programming", "brute-force to optimal reasoning", "computer networks"],
        grade: "one",
        sources: [
          {
            label: "Juspay SDE-1 interview experience via HackerEarth (undated, GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=447763",
            kind: "candidate-report",
          },
          {
            label: "Juspay Internship Interview Experience (On-Campus), June 2021 (GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=688691",
            kind: "candidate-report",
            year: 2021,
          },
        ],
        duration: "About 2 hours (SDE-1 report)",
        variesBy: "Campus intern live coding was 1 hour with tree problems and a take-home puzzle set.",
      },
      {
        name: "Founder / CEO conversation",
        type: "hld",
        format:
          "Stretched over about a day; the candidate mentions a recruiter call to schedule and a Slack connection for the solution. Starts with background and likes and dislikes, then in-depth system questions and a problem statement the candidate worked out by the next morning, agreed an approach on, and coded. Later topics included projects and five-year plans.",
        tested: ["system design depth", "problem approach discussion", "long-term goals and fit"],
        grade: "one",
        sources: [
          {
            label: "Juspay SDE-1 interview experience via HackerEarth (undated, GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=447763",
            kind: "candidate-report",
          },
        ],
        variesBy: "Reported by one SDE-1 candidate only; not known whether it applies at other levels.",
      },
      {
        name: "HR round",
        type: "hr",
        format: "Described as a formality at the end, followed by the selection decision.",
        tested: ["none reported"],
        grade: "one",
        sources: [
          {
            label: "Juspay SDE-1 interview experience via HackerEarth (undated, GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=447763",
            kind: "candidate-report",
          },
        ],
      },
      {
        name: "Learnathon (Slack, API testing)",
        type: "take-home",
        format:
          "Intern-route challenge over Slack with an assigned buddy: API-testing challenges in Postman, then writing test cases for an automated refund scenario. A final interview with two interviewers followed, covering the Postman test cases, college projects and a backend question.",
        tested: ["API testing", "test-case design", "payments scenarios", "learning an unfamiliar tool quickly"],
        grade: "one",
        sources: [
          {
            label: "Juspay Internship Interview Experience (undated, GeeksforGeeks)",
            url: "https://www.geeksforgeeks.org/?p=671552",
            kind: "candidate-report",
          },
        ],
        variesBy: "Reported on the intern/fresher route only.",
      },
    ],
    gaps: "Could not read LeetCode, Naukri Code360 or Glassdoor pages (403), so 2025-2026 candidate reports (including a 7-round Glassdoor description and LeetCode hackathon write-ups) are not citable. Of the GeeksforGeeks pages, only one gives an interview date (June 2021); the SDE-1 and first intern pages show only a last-updated date, and the SDE-1 page says the process was remote because of the pandemic. No SDE-2/SDE-3 specific process, no durations for most rounds, no timeline in weeks, and no GitHub company list were found. The hackathon tree-locking problem is only named via a link on the page; its rules were not read on a fetched page.",
  },
  {
    company: "myntra",
    summary:
      "Myntra reports describe an online test, one or two live DSA rounds, a machine coding or low-level design round for senior candidates, a hiring-manager conversation with high-level design, and an HR round. Readable accounts are senior-level and undated; recent SDE-1/2 detail was not readable.",
    rounds: [
      {
        name: "Online assessment",
        type: "oa",
        format:
          "Timed test on a hosted platform. The senior report had 30 MCQs across web basics, Java and data structures plus one coding question; other reports mention one hard array problem or three problems.",
        tested: ["MCQ fundamentals", "data structures", "array problem solving"],
        grade: "one",
        sources: [
          {
            label: "Myntra Interview Experience for Senior SDE (GeeksforGeeks, undated)",
            url: "https://www.geeksforgeeks.org/?p=369559",
            kind: "candidate-report",
          },
          {
            label: "Myntra interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-myntra-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
        ],
        duration: "About 60 minutes (senior report); about 90 minutes in the guide's reports",
        variesBy: "Format differs by role; an internship report in the guide had three problems and some MCQs.",
      },
      {
        name: "Live coding (one or two rounds)",
        type: "dsa",
        format:
          "Interviewer-led DSA problems, with trees appearing often per the guide, which also says interviewers ask for running time and alternative approaches. One senior report has two DS-algo rounds; another has one round of three problems plus a follow-up.",
        tested: [
          "trees",
          "arrays, pairs and stock problems",
          "board and grid path problems",
          "complexity analysis",
          "alternative approaches",
        ],
        grade: "one",
        sources: [
          {
            label: "Myntra Interview Experience, 5 years, Senior Software Engineer (GeeksforGeeks, undated)",
            url: "https://www.geeksforgeeks.org/?p=370480",
            kind: "candidate-report",
          },
          {
            label: "Myntra Interview Experience for Senior SDE (GeeksforGeeks, undated)",
            url: "https://www.geeksforgeeks.org/?p=369559",
            kind: "candidate-report",
          },
          {
            label: "Myntra interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-myntra-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
        ],
        duration: "About 60 minutes each (guide)",
        variesBy: "Senior (5 years) report had two DSA rounds; campus loops weigh core CS more.",
      },
      {
        name: "Machine coding / low-level design",
        type: "machine-coding",
        format:
          "Problem given up front and built as a console program in memory: working code and domain-matching classes that accept new requirements. Spend early minutes on clarifying questions. Mostly reported by senior candidates.",
        tested: ["object modelling", "working code", "extensibility", "requirement clarification"],
        grade: "one",
        sources: [
          {
            label: "Myntra Interview Experience, 5 years, Senior Software Engineer (GeeksforGeeks, undated)",
            url: "https://www.geeksforgeeks.org/?p=370480",
            kind: "candidate-report",
          },
          {
            label: "What to expect in the Myntra system design interview (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-to-expect-in-the-myntra-system-design-interview",
            kind: "prep-guide",
          },
        ],
        variesBy: "Senior roles; the DesignGurus guide says junior candidates rarely report a design round.",
      },
      {
        name: "System design / hiring manager",
        type: "hld",
        format:
          "Design rounds in the two senior reports: a nearby-places app with schema, API and a location query plus a user feed (caching, push versus pull), and a notification system on database changes. A guide instead folds design into the hiring-manager conversation about current work, stack and API design choices; one report names a hiring-manager round without details.",
        tested: ["schema and API design", "caching and feeds", "scalability trade-offs", "project depth"],
        grade: "one",
        sources: [
          {
            label: "Myntra Interview Experience for Senior SDE (GeeksforGeeks, undated)",
            url: "https://www.geeksforgeeks.org/?p=369559",
            kind: "candidate-report",
          },
          {
            label: "Myntra Interview Experience, 5 years, Senior Software Engineer (GeeksforGeeks, undated)",
            url: "https://www.geeksforgeeks.org/?p=370480",
            kind: "candidate-report",
          },
          {
            label: "Myntra interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-myntra-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
        ],
        variesBy:
          "A guide, citing public statements by Myntra technology leadership, says seniors are also judged on scalability, reliability, performance and security.",
      },
      {
        name: "HR round",
        type: "hr",
        format:
          "One senior report covers the most challenging technical work, a design question on Twitter trending hashtags, reasons for leaving, what makes a good team and behavioural questions; the guide lists strengths and weaknesses and the hardest problem solved.",
        tested: ["motivation for change", "project ownership", "team fit"],
        variesBy: "The other senior report does not mention an HR round.",
        grade: "one",
        sources: [
          {
            label: "Myntra Interview Experience, 5 years, Senior Software Engineer (GeeksforGeeks, undated)",
            url: "https://www.geeksforgeeks.org/?p=370480",
            kind: "candidate-report",
          },
          {
            label: "Myntra interview process round by round (DesignGurus)",
            url: "https://www.designgurus.io/answers/detail/what-is-the-myntra-interview-process-like-round-by-round",
            kind: "prep-guide",
          },
        ],
      },
    ],
    typicalWeeks: "A prep guide says reports vary but suggests planning for several weeks; no firm figure",
    gaps: "Neither GeeksforGeeks Myntra page shows an interview date (pages carry only update dates), so both may predate 2022 and no source is confirmed 2022 or later; that is why nothing is graded A. DesignGurus pages are undated aggregators and not independent of the candidate reports. LeetCode, Glassdoor and Naukri Code360 returned 403, so recent (2024-2026) SDE-1/2 reports and a frontend report are not citable. No SDE-2 vs SDE-3 split, no hiring-manager duration, and no GitHub company list found. Rate limiter, parking lot and bus reservation prompts appear only in the prep guide and were left out.",
  },
];
