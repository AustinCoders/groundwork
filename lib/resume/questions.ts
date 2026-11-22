import { monthIndex } from "./parse";
import { skillById } from "./skills";
import { OWNER_VERB, WEAK_OPENER, clip, hashId, lowerFirst, metricIn, monthLabel, orgOf } from "./text";
import type { Catalogue, CatalogueQuestion, ParsedResume, QuestionGroup, ResumeQuestion, ResumeRole } from "./types";

const MAX_DEEP_DIVE = 7;
const MAX_OWNER = 5;
const MAX_SKILLS = 10;
const BANK_PER_SKILL = 3;

function make(group: QuestionGroup, q: string, rest: Omit<ResumeQuestion, "id" | "group" | "q">): ResumeQuestion {
  return { id: hashId(`${group}|${q}|${rest.quote ?? ""}`), group, q, ...rest };
}

function deepDive(parsed: ParsedResume): ResumeQuestion[] {
  const out: ResumeQuestion[] = [];
  const used = new Set<string>();
  for (const bullet of parsed.bullets) {
    if (out.length >= MAX_DEEP_DIVE) break;
    const metric = metricIn(bullet);
    if (!metric || used.has(metric.toLowerCase()) || /people|developers|engineers|teams$/i.test(metric)) continue;
    used.add(metric.toLowerCase());
    out.push(
      make("deep-dive", `How did you measure “${metric}”, and what was it before you started?`, {
        why: "Interviewers pick one number off the page to check whether it is a measurement or decoration. If one number falls apart, every other number on the page starts to look like a claim.",
        quote: bullet,
        followUps: [
          "Which tool or dashboard did that number come from?",
          "Over what time window, and against what baseline?",
          "What else changed in that period that could explain it?",
          "Which part of it was your work and which was the team's?",
        ],
      })
    );
  }
  let owners = 0;
  for (const bullet of parsed.bullets) {
    if (owners >= MAX_OWNER) break;
    if (metricIn(bullet)) continue;
    if (WEAK_OPENER.test(bullet)) {
      owners += 1;
      out.push(
        make(
          "deep-dive",
          `You wrote “${clip(bullet, 12)}”. What exactly was your part, and what did you decide yourself?`,
          {
            why: "Vague verbs like “worked on” or “responsible for” make the interviewer ask who really did the work. Have a one-line answer about what you decided.",
            quote: bullet,
            followUps: [
              "Who else worked on it?",
              "What would not have happened without you?",
              "What did you get wrong?",
            ],
          }
        )
      );
      continue;
    }
    if (OWNER_VERB.test(bullet)) {
      owners += 1;
      out.push(
        make("deep-dive", `Walk me through how you ${lowerFirst(clip(bullet.replace(/[.;]$/, ""), 14))}.`, {
          why: "Anything you say you built is fair game for a design discussion: the options, the choice and what went wrong.",
          quote: bullet,
          followUps: [
            "What were the alternatives, and why this one?",
            "What broke first in production?",
            "What would you change if you did it again?",
          ],
        })
      );
    }
  }
  return out;
}

function sortedRoles(roles: ResumeRole[]): ResumeRole[] {
  return roles.filter((r) => r.start).sort((a, b) => monthIndex(b.start!) - monthIndex(a.start!));
}

function roleQuestions(parsed: ParsedResume, now: { y: number; m: number }): ResumeQuestion[] {
  const out: ResumeQuestion[] = [];
  const roles = sortedRoles(parsed.roles);
  const current = roles.find((r) => r.current);
  if (current) {
    const org = orgOf(current.heading);
    out.push(
      make("roles", `What do you own at ${org} today, end to end?`, {
        why: "The first technical question is usually about your current job. Name the systems you own, the people you work with and what would break if you were away for a week.",
        quote: current.heading,
        followUps: [
          "Draw how a request flows through what you own.",
          "What is the biggest risk in that system right now?",
        ],
      }),
      make("roles", `Your resume says you are still at ${org}. Why are you looking to move now?`, {
        why: "“Present” on a resume is always checked. If the role has ended, change the end date before you apply and have a calm, honest answer ready.",
        quote: `${current.heading} · ${current.dateText}`,
        followUps: ["What is your notice period?", "What would make you stay?"],
      })
    );
  }
  for (const role of roles.filter((r) => !r.current).slice(0, 3)) {
    const org = orgOf(role.heading);
    out.push(
      make("roles", `Why did you move on from ${org}?`, {
        why: "Keep it forward-looking: what you wanted next, not what was wrong with them.",
        quote: `${role.heading} · ${role.dateText}`,
        followUps: ["What would your manager there say about you?", "What did you leave unfinished?"],
      })
    );
  }
  for (const role of roles) {
    if (!role.start || /intern|trainee/i.test(role.heading)) continue;
    const end = role.current ? now : role.end;
    if (!end) continue;
    const months = monthIndex(end) - monthIndex(role.start) + 1;
    if (months > 0 && months < 12) {
      const org = orgOf(role.heading);
      out.push(
        make("gaps", `You were at ${org} for ${months} month${months === 1 ? "" : "s"}. What happened?`, {
          why: "Short stints are read as a risk. One honest sentence about why, and what you learned about choosing a team, closes it.",
          quote: `${role.heading} · ${role.dateText}`,
          followUps: ["How do you decide whether to join a team now?"],
        })
      );
    }
  }
  const timeline = [...roles].reverse();
  for (let i = 1; i < timeline.length; i++) {
    const before = timeline[i - 1];
    const after = timeline[i];
    if (!before.end || before.current || !after.start) continue;
    const gap = monthIndex(after.start) - monthIndex(before.end, true) - 1;
    if (gap >= 3) {
      out.push(
        make(
          "gaps",
          `There is a gap from ${monthLabel(before.end)} to ${monthLabel(after.start)}. What were you doing then?`,
          {
            why: "Gaps are normal. Silence about them is what worries interviewers. Say what you did with the time in one or two lines.",
            quote: `${orgOf(before.heading)} → ${orgOf(after.heading)}`,
            followUps: ["What did you learn or build in that time?"],
          }
        )
      );
    } else if (gap < -2) {
      out.push(
        make("gaps", `${orgOf(before.heading)} and ${orgOf(after.heading)} overlap. Were you doing both at once?`, {
          why: "Overlapping dates make people wonder about moonlighting. If one was freelance or part-time, say so on the resume.",
          quote: `${before.dateText} and ${after.dateText}`,
          followUps: ["Did your employer know about the other work?"],
        })
      );
    }
  }
  return out;
}

function projectQuestions(parsed: ParsedResume): ResumeQuestion[] {
  return parsed.projects.slice(0, 4).map((project) => {
    const name = project.name ? clip(project.name.replace(/\s*\(.*\)\s*$/, ""), 8) : clip(project.bullets[0] ?? "", 8);
    const stack = project.name.match(/\(([^)]+)\)/)?.[1]?.split(/,\s*/)[0];
    return make("projects", `Why did you build ${name}, and who uses it?`, {
      why: "Side projects are where interviewers go when they want to see your own decisions, without a team to hide behind.",
      quote: project.name || project.bullets[0],
      followUps: [
        "Draw the architecture.",
        "What was the hardest bug, and how did you find it?",
        "What breaks first at ten times the users?",
        ...(stack ? [`Why ${stack} and not something simpler?`] : []),
      ],
    });
  });
}

function fromBank(question: CatalogueQuestion, group: QuestionGroup, skill?: string): ResumeQuestion {
  return make(group, question.q, {
    why: `From ${question.source}. It is a question asked in real interviews about this topic.`,
    followUps: [],
    skill,
    source: { label: question.source, href: question.href },
  });
}

function skillQuestions(parsed: ParsedResume, catalogue: Catalogue, used: Set<string>): ResumeQuestion[] {
  const out: ResumeQuestion[] = [];
  parsed.skills.slice(0, MAX_SKILLS).forEach((id, index) => {
    const skill = skillById(id);
    if (!skill) return;
    if (index < 6) {
      out.push(
        make(
          "skills",
          `You list ${skill.name}. Where did you use it in production, and what went wrong that the docs did not warn you about?`,
          {
            why: "Every skill on the page is an invitation. Pick one real story per skill before the interview.",
            followUps: ["What would you use instead, and when?"],
            skill: id,
          }
        )
      );
    }
    const picks = catalogue.questions
      .filter((q) => q.tags.includes(id) && !used.has(q.href + q.q))
      .slice(0, BANK_PER_SKILL);
    for (const pick of picks) {
      used.add(pick.href + pick.q);
      out.push(fromBank(pick, "skills", id));
    }
  });
  return out;
}

function gapQuestions(missing: string[], catalogue: Catalogue, used: Set<string>): ResumeQuestion[] {
  const out: ResumeQuestion[] = [];
  for (const id of missing.slice(0, 6)) {
    const skill = skillById(id);
    if (!skill) continue;
    out.push(
      make("gaps", `The role asks for ${skill.name}, and your resume does not show it. What would you say?`, {
        why: "Interviewers probe the gap between the job description and your page. Say honestly where you stand, then show the nearest thing you have done.",
        followUps: ["What is the nearest thing you have used?", "How would you get productive in it in two weeks?"],
        skill: id,
      })
    );
    const pick = catalogue.questions.find((q) => q.tags.includes(id) && !used.has(q.href + q.q));
    if (pick) {
      used.add(pick.href + pick.q);
      out.push(fromBank(pick, "gaps", id));
    }
  }
  return out;
}

function peopleQuestions(parsed: ParsedResume, catalogue: Catalogue, used: Set<string>): ResumeQuestion[] {
  const years = (parsed.months ?? 0) / 12;
  const out: ResumeQuestion[] = [
    make("people", "Walk me through your resume in two minutes, ending with why this role.", {
      why: "Almost every loop opens with this. Rehearse it out loud and time it.",
      followUps: ["Which part of that are you proudest of?"],
    }),
    make("people", "Tell me about a production incident you handled. What did you do in the first ten minutes?", {
      why: "This checks calm, ownership and whether you fix the cause or only the symptom.",
      followUps: ["What alarm or check did you add afterwards?"],
    }),
    make("people", "Tell me about a time you disagreed with a technical decision. How did it end?", {
      why: "They want to hear that you can disagree with evidence and still commit.",
      followUps: ["Looking back, who was right?"],
    }),
  ];
  if (years >= 4) {
    out.push(
      make("people", "Tell me about a technical decision you made that other people had to live with.", {
        why: "At your level they look for decisions with a blast radius, and whether you owned the consequences.",
        followUps: ["What did it cost, and who paid?"],
      })
    );
  }
  if (parsed.skills.includes("mentoring")) {
    out.push(
      make("people", "You mention mentoring or leading people. Tell me about someone who got better because of you.", {
        why: "Leadership lines on a resume are checked with one concrete story and a result.",
        followUps: ["What did you do when it was not working?"],
      })
    );
  }
  for (const pick of catalogue.questions.filter((q) => q.people && !used.has(q.href + q.q)).slice(0, 3)) {
    used.add(pick.href + pick.q);
    out.push(fromBank(pick, "people"));
  }
  return out;
}

export function buildQuestions(
  parsed: ParsedResume,
  catalogue: Catalogue,
  missing: string[],
  now: { y: number; m: number }
): ResumeQuestion[] {
  const used = new Set<string>();
  const all = [
    ...deepDive(parsed),
    ...roleQuestions(parsed, now),
    ...projectQuestions(parsed),
    ...skillQuestions(parsed, catalogue, used),
    ...gapQuestions(missing, catalogue, used),
    ...peopleQuestions(parsed, catalogue, used),
  ];
  const seen = new Set<string>();
  return all.filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)));
}
