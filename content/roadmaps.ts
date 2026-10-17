export type RoadmapOrder = "in-order" | "any-order";

export type RoadmapStepSource = { topic: string; why: string } | { round: string };

export interface RoadmapStageSource {
  id: string;
  title: string;
  blurb: string;
  order: RoadmapOrder;
  steps: RoadmapStepSource[];
}

export interface RoadmapSource {
  id: string;
  title: string;
  tagline: string;
  pain: string;
  accent: string;
  stages: RoadmapStageSource[];
}

export const ROADMAPS: RoadmapSource[] = [
  {
    id: "frontend",
    title: "Frontend developer",
    tagline: "Build interfaces, then explain them",
    pain: "You can make a page work, but the ideas underneath still feel like magic, and a live widget round scares you.",
    accent: "blue",
    stages: [
      {
        id: "foundations",
        title: "The foundations",
        blurb: "Three things every later step assumes you can already do.",
        order: "any-order",
        steps: [
          { topic: "html", why: "The structure every page and every component finally renders to." },
          { topic: "css", why: "How a page is laid out and styled before any JavaScript runs." },
          { topic: "git", why: "How you save, share and undo work. Every team assumes it." },
        ],
      },
      {
        id: "language",
        title: "The language underneath",
        blurb: "Everything after this is written in it.",
        order: "in-order",
        steps: [{ topic: "js", why: "How code runs, line by line, before you add a framework on top." }],
      },
      {
        id: "safety",
        title: "Make it safe to change",
        blurb: "Two habits that let you edit working code without fear.",
        order: "any-order",
        steps: [
          { topic: "typescript", why: "Types for the JavaScript you already write." },
          { topic: "testing", why: "How you change code without breaking it." },
        ],
      },
      {
        id: "interfaces",
        title: "Build interfaces",
        blurb: "A component framework, then the framework that wraps it.",
        order: "in-order",
        steps: [
          { topic: "react", why: "Components, state and re-renders, explained from the engine up." },
          { topic: "nextjs", why: "React with routing, data fetching and a server." },
        ],
      },
      {
        id: "rounds",
        title: "Earn the offer",
        blurb: "The interview rounds that test everything above.",
        order: "in-order",
        steps: [{ round: "r2" }, { round: "r3" }, { round: "r4" }, { round: "r4fe" }],
      },
    ],
  },
  {
    id: "backend",
    title: "Backend developer",
    tagline: "Serve data, keep it safe, ship it",
    pain: "You can write a route, but data modelling, failure and deployment still feel like someone else's job.",
    accent: "green",
    stages: [
      {
        id: "foundations",
        title: "The foundations",
        blurb: "The language, the version control and the types around the server code.",
        order: "any-order",
        steps: [
          { topic: "git", why: "How you save, share and undo work. Every team assumes it." },
          { topic: "js", why: "The language a Node server is written in." },
          { topic: "typescript", why: "Types for the JavaScript you already write." },
        ],
      },
      {
        id: "servers",
        title: "Servers and APIs",
        blurb: "Run JavaScript on a server, then give it structure.",
        order: "in-order",
        steps: [
          { topic: "node", why: "JavaScript on the server." },
          { topic: "nestjs", why: "Structure for a larger Node API." },
        ],
      },
      {
        id: "data",
        title: "Where the data lives",
        blurb: "Storing data durably, and keeping the hot part close.",
        order: "in-order",
        steps: [
          { topic: "databases", why: "Where an app keeps its data, and how to ask for it." },
          { topic: "redis", why: "Caches, queues and rate limits." },
        ],
      },
      {
        id: "shipping",
        title: "Ship it",
        blurb: "Package what you built and run it somewhere real.",
        order: "in-order",
        steps: [
          { topic: "docker", why: "Package an app so it runs the same everywhere." },
          { topic: "cloud-devops", why: "Deploy, scale and watch what you ship." },
        ],
      },
      {
        id: "design",
        title: "Design whole systems",
        blurb: "Reason about the parts together, then prove it in the rounds.",
        order: "in-order",
        steps: [
          { topic: "system-design", why: "How the pieces fit together at scale." },
          { round: "r5" },
          { round: "r6" },
          { round: "r9" },
        ],
      },
    ],
  },
  {
    id: "interview",
    title: "Interview preparation",
    tagline: "Patterns first, then every round",
    pain: "You are good at the work and out of practice at the interview: puzzles with no theory, and rounds nobody explained.",
    accent: "purple",
    stages: [
      {
        id: "before",
        title: "Before the loop",
        blurb: "How your profile reads from the other side, and the filters that end most loops early.",
        order: "in-order",
        steps: [{ round: "scout" }, { round: "r1" }, { round: "r1oa" }, { round: "r1th" }, { round: "r1tp" }],
      },
      {
        id: "patterns",
        title: "Patterns, not puzzle answers",
        blurb: "The algorithms and data structures behind the coding round.",
        order: "in-order",
        steps: [
          { topic: "dsa", why: "Problems grouped by the pattern they teach, each with a chapter that explains it." },
        ],
      },
      {
        id: "technical",
        title: "The technical rounds",
        blurb: "Machine coding, the algorithms round and design.",
        order: "in-order",
        steps: [
          { round: "r2" },
          { round: "r7" },
          { topic: "system-design", why: "How the pieces fit together at scale." },
          { round: "r8" },
        ],
      },
      {
        id: "people",
        title: "The people rounds",
        blurb: "Your resume under a microscope, and behaviour.",
        order: "in-order",
        steps: [{ round: "r10" }, { round: "r11" }, { round: "r11lp" }],
      },
      {
        id: "offer",
        title: "The offer",
        blurb: "The number, the level, and the last week.",
        order: "in-order",
        steps: [{ round: "r12" }, { round: "r12lv" }, { round: "r13" }, { round: "plan" }],
      },
    ],
  },
  {
    id: "senior",
    title: "Senior and system design",
    tagline: "Reason about the whole system",
    pain: "The questions stop being about syntax. They are about trade-offs, failure, and proving you can lead without the title.",
    accent: "orange",
    stages: [
      {
        id: "bar",
        title: "What changes at the senior bar",
        blurb: "What the loop starts asking once the basics are assumed.",
        order: "in-order",
        steps: [{ round: "s0" }],
      },
      {
        id: "design",
        title: "Design at scale",
        blurb: "Trade-offs, failure and the shape of a whole system.",
        order: "in-order",
        steps: [
          { topic: "system-design", why: "How the pieces fit together at scale." },
          { topic: "databases", why: "Where an app keeps its data, and how to ask for it." },
          { round: "s2" },
        ],
      },
      {
        id: "depth",
        title: "Depth under the hood",
        blurb: "Hard algorithms, and what the runtime does underneath your code.",
        order: "any-order",
        steps: [{ round: "s1" }, { round: "s3" }],
      },
      {
        id: "lead",
        title: "Lead without the title",
        blurb: "The stories that survive the follow-up.",
        order: "in-order",
        steps: [{ round: "s4" }],
      },
    ],
  },
];
