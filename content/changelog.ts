export interface ChangelogEntry {
  date: string;
  title: string;
  items: string[];
}

export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    date: "2026-11-07",
    title: "About, changelog, contact and accessibility pages",
    items: [
      "Four new pages that say how the site is made and checked, what changed, how to reach us, and what is and is not accessible yet.",
      "Fixes from the October benchmark: DSA audit bugs corrected, an iterative reference for the large-grid islands problem, and seven missing NeetCode 150 problems added.",
      "Fixed the exercise page header, where Run, Debug and Submit were cut off at the top on windows between about 1000 and 1200 pixels wide.",
      "One site footer on every reading page, with links that follow the section you are in. The workspaces (exercises, playground, whiteboard) stay without it.",
    ],
  },
  {
    date: "2026-10-21",
    title: "Company answers run in place, and a nine-theme check",
    items: [
      "Coding and machine coding answers now have a Run button that runs the shipped code against its test cases in a sandboxed worker, plus a box for your own input.",
      "Text contrast on the main pages was checked in all nine themes.",
      "A benchmark of the site against larger learning platforms was written down in the repository.",
    ],
  },
  {
    date: "2026-10-20",
    title: "Whiteboard boards from answer diagrams",
    items: [
      "Every system design and machine coding answer has an Open on the whiteboard button with a pre-drawn board and a step-by-step walkthrough.",
      "Some coding answers draw their dry run on the board.",
    ],
  },
  {
    date: "2026-10-20",
    title: "Round content for company questions",
    items: [
      "26 machine coding and low-level design answers with runnable code and checks.",
      "Five CS and SQL question sets with model answers, and people-round sections for all 22 company pages.",
      "Model answers for every item under what can be asked in each kind of round, and 14 more coding answers for thinly covered companies.",
    ],
  },
  {
    date: "2026-10-19",
    title: "Company questions, redesigned and widened",
    items: [
      "22 company pages with interview process timelines, including ten Indian startups.",
      "A hub with filters, a try-first clock, diagrams and dry-run steppers, and problems linked to the playground.",
      "A new footer on the home page.",
    ],
  },
  {
    date: "2026-10-19",
    title: "System design chapters and an audit of DSA",
    items: [
      "Three more system design chapters: microservices and discovery, security basics, release safety.",
      "The 48 DSA chapters, their exercises and quizzes were audited and the findings recorded.",
    ],
  },
  {
    date: "2026-10-18",
    title: "Practice for system design",
    items: [
      "A question pool for each of the 33 system design chapters, and design drills on the six walkthrough chapters.",
    ],
  },
  {
    date: "2026-10-17",
    title: "Nine new system design chapters and four roadmaps",
    items: [
      "Replication, transactions and isolation, storage engines, time ordering and IDs, batch and stream processing, key-value store, notifications, web crawler and payments.",
      "Four roadmaps built from what is actually written, with your progress marked on each.",
      "A system design parts library on the whiteboard, and a step-through player for closures.",
    ],
  },
  {
    date: "2026-10-15",
    title: "Data structures and algorithms rebuilt",
    items: [
      "48 chapters, 396 new exercises with tests, and a question pool for every chapter, each answer checked by an independent review.",
    ],
  },
  {
    date: "2026-10-13",
    title: "A level check and plan for DSA",
    items: [
      "A placement check that builds a plan, and a single DSA home with a journey map.",
      "Smaller reading text and more zoom steps in chapters.",
    ],
  },
  {
    date: "2026-10-12",
    title: "A first-visit tour and a fuller home family",
    items: ["A skippable tour of the site, and the privacy, error and 404 pages restyled to match the home page."],
  },
];
