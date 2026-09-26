import type { Competency, StageId } from "@/lib/mock/types";

export interface StageGuide {
  pitch: string;
  shape: string[];
  tips: string[];
  markedDown: string[];
}

export const STAGE_GUIDE: Record<StageId, StageGuide> = {
  screening: {
    pitch: "Twenty minutes with someone who cannot judge your code but can end the process today.",
    shape: ["Who you are in 30 seconds", "Why this role", "Notice period", "A range, not a number"],
    tips: [
      "Open with a 30-second story: current role, the one thing you are proudest of, and why you are looking.",
      "Know your notice period, your current CTC and your expected range before the call. Say the range, not a single number.",
      "Ask one real question about the team. It is the only signal they have that you are choosing too.",
    ],
    markedDown: ["Rambling past two minutes on any answer", "Naming a number before they have named a band"],
  },
  phone: {
    pitch: "A senior engineer deciding in 45 minutes whether a full loop is worth their team's afternoon.",
    shape: ["Answer in one line", "Then the why", "Then one real example"],
    tips: [
      "Lead with the answer, then explain. A phone screen rewards people who get to the point.",
      "Every claim needs a specific: a project, a bug, a number. General answers sound like reading.",
      "If you do not know, say what you would check first. That is still a signal.",
    ],
    markedDown: ["Answers that circle without landing on a specific", "Bluffing through something you have not used"],
  },
  coding: {
    pitch: "Real problems graded by real tests. They want to see how you think before they see what you type.",
    shape: ["Restate the problem", "Examples and edge cases", "Brute force, then better", "Code", "Test it"],
    tips: [
      "Say the brute force first and its cost. Then improve it. An interviewer cannot credit what you never said.",
      "Name the edge cases before you code: empty input, one element, duplicates, very large numbers.",
      "Run it. A working O(n log n) beats an O(n) that does not pass.",
    ],
    markedDown: ["Silence while you think", "Typing before you have a plan"],
  },
  machine: {
    pitch: "Build a working feature in 60–90 minutes. It is judged the way a pull request is judged.",
    shape: ["Clarify scope", "State and data first", "Get it rendering", "Make it work", "Then make it nice"],
    tips: [
      "Get something on screen in the first 15 minutes, then grow it. A half-built perfect design scores zero.",
      "Split it into small components with clear props. One giant file reads like you have never worked in a team.",
      "Leave 10 minutes to walk them through it: what you would do next, and what you cut on purpose.",
    ],
    markedDown: ["Nothing running at the end", "Styling before the behaviour works"],
  },
  javascript: {
    pitch: "The round that tells a framework user apart from someone who understands the language underneath.",
    shape: ["Definition", "How the engine does it", "A small example", "Where it bites in real code"],
    tips: [
      'Explain the mechanism, not the rule. "Closures keep a reference to the scope" beats "inner functions can see outer variables".',
      "Reach for a tiny example you can say out loud: three lines of code usually settle it.",
      "Tie it back to a real bug you have seen. That is what separates a mid-level answer from a senior one.",
    ],
    markedDown: ["Reciting a definition without the why", "Confusing the event loop order under follow-up"],
  },
  react: {
    pitch: "Rendering, state and the server boundary. This is where frontend seniority is actually decided.",
    shape: ["What React does", "Why it does it", "The trade-off", "What you would do in your codebase"],
    tips: [
      "Talk about renders, not hooks. Why something re-rendered is the question under half the questions.",
      "Know when not to reach for memo, context or a state library, and say so.",
      "Mention measurement: the Profiler, a slow interaction you fixed, and how you knew it was fixed.",
    ],
    markedDown: ["Hook rules memorised, rendering model missing", "Reaching for a library for every problem"],
  },
  backend: {
    pitch: "What your service does when nobody is watching: the runtime, the database, and the failure cases.",
    shape: ["The happy path", "What can fail", "How you would know", "What you would change"],
    tips: [
      "Talk in requests: what happens from the moment one arrives to the moment it leaves.",
      "Every database answer should mention an index, a transaction or a consistency trade-off.",
      "Name the failure mode before they do: timeouts, retries, duplicate writes, a slow query.",
    ],
    markedDown: ["Framework syntax with no idea of the runtime", "No mention of what happens when things fail"],
  },
  design: {
    pitch: "Boxes and arrows are the easy part. They are listening for the trade-offs and the numbers.",
    shape: ["Requirements", "Rough numbers", "API", "Data model", "Scale it", "Trade-offs"],
    tips: [
      "Spend the first five minutes on requirements and scale. Designing before you know the load is the most common fail.",
      "Do the back-of-envelope maths out loud: requests per second, storage per year, read to write ratio.",
      "For every component you add, say what it costs. A cache is also a consistency problem.",
    ],
    markedDown: ["Drawing before asking what is being built", "No trade-off named for any choice"],
  },
  infra: {
    pitch: "Whether the deployment and cloud lines on your resume are things you did or things you watched.",
    shape: ["What you ran", "How it shipped", "How you watched it", "What broke once"],
    tips: [
      "Describe the pipeline you actually used, step by step, from merge to production.",
      "Know the difference between what you configured and what a platform team gave you. Say which is which.",
      "Have one incident ready: what broke, how you found out, and what you changed after.",
    ],
    markedDown: ["Overclaiming cloud depth", "No idea how a release is rolled back"],
  },
  resume: {
    pitch: 'Every number and every "led" on your resume gets collected on. This round checks one of them hard.',
    shape: ["The context", "What you did", "The number and how you measured it", "What you would do differently"],
    tips: [
      "For every project, know your exact part, the team size and the one metric that moved.",
      'Say "I" for what you did and "we" for what the team did. Mixing them up is noticed.',
      "Pick the project you can go three follow-ups deep on, and steer towards it.",
    ],
    markedDown: ["A number you cannot explain how you measured", "Taking credit for the whole team's work"],
  },
  behaviour: {
    pitch: "Scored as carefully as the technical rounds. It often decides your level, and your number with it.",
    shape: ["Situation", "Task", "Action (yours)", "Result, with a number", "What you learned"],
    tips: [
      'Use one specific story, not a habit. "Once, in March..." beats "I usually..." every time.',
      "Spend most of the answer on your actions. The situation needs two sentences, not two minutes.",
      "End with a result you can count and what you would do differently. Reflection is what gets a senior rating.",
    ],
    markedDown: ["Generic answers with no specific story", "Blaming others in a conflict story"],
  },
  hr: {
    pitch: "The round that decides what is actually written on your offer letter.",
    shape: ["Thank them", "Anchor on the role", "Your range, with a reason", "Ask for time"],
    tips: [
      'Never accept in the room. "Thank you, I would like a day to look at the whole offer" is always fine.',
      "Negotiate the level and the joining bonus as well as the base. They often move more easily.",
      "Have a competing timeline or offer ready to mention honestly, not as a threat.",
    ],
    markedDown: ["Accepting on the spot", "Giving the first number with no reason behind it"],
  },
};

export interface NextStep {
  label: string;
  href: string;
}

export const COMPETENCY_PLAN: Record<Competency, { why: string; steps: NextStep[] }> = {
  coding: {
    why: "Coding rounds are usually core. A weak score here sinks most loops on its own.",
    steps: [
      { label: "Two pointers, the first real pattern", href: "/dsa/dsa-two-pointers" },
      { label: "Sliding window", href: "/dsa/dsa-sliding-window" },
      { label: "The DSA round, how it is scored", href: "/interview/r7" },
    ],
  },
  javascript: {
    why: "Most follow-ups land here: closures, the event loop and async order.",
    steps: [
      { label: "Closures, finally clear", href: "/notes/closures" },
      { label: "Async, properly", href: "/notes/async-properly" },
      { label: "The JavaScript round", href: "/interview/r3" },
    ],
  },
  frontend: {
    why: "Rendering and state decide frontend seniority more than any API question.",
    steps: [
      { label: "Why React re-renders, and memo", href: "/react/react-memoisation" },
      { label: "The machine coding round", href: "/interview/r2" },
      { label: "The React round", href: "/interview/r4" },
    ],
  },
  backend: {
    why: "Backend answers are judged on failure cases, not on framework syntax.",
    steps: [
      { label: "The Node and API round", href: "/interview/r5" },
      { label: "Databases and Redis", href: "/interview/r6" },
      { label: "Caching fundamentals", href: "/system-design/sysdes-caching-fundamentals" },
    ],
  },
  design: {
    why: "The design round sets the level you are hired at, from mid-level up.",
    steps: [
      { label: "The system design mental model", href: "/system-design/sysdes-interview-mental-model" },
      { label: "Capacity estimation", href: "/system-design/sysdes-capacity-estimation" },
      { label: "The system design round", href: "/interview/r8" },
    ],
  },
  behaviour: {
    why: "Behavioural answers move your level and your number. Specific stories win them.",
    steps: [
      { label: "The behavioural round", href: "/interview/r11" },
      { label: "Resume grilling", href: "/interview/r10" },
      { label: "Behavioural at staff level", href: "/interview/s4" },
    ],
  },
  negotiation: {
    why: "The last round is where money is won or left on the table.",
    steps: [
      { label: "HR and the number", href: "/interview/r12" },
      { label: "Levels and equity", href: "/interview/r12lv" },
    ],
  },
};

export const LOBBY_STEPS = [
  {
    title: "Plan the loop",
    body: "Pick the role, your experience and the kind of company. The rounds, their order and their weight follow real loops.",
  },
  {
    title: "Answer out loud",
    body: "Each question has a clock. Say the answer as you would in the room, and jot the skeleton if it helps.",
  },
  {
    title: "Get pushed",
    body: "The interviewer follows up the way real ones do. That is where a prepared answer runs out.",
  },
  {
    title: "Read the debrief",
    body: "Mark yourself against what the round is listening for. Core rounds can sink the loop, just like a real committee.",
  },
];
