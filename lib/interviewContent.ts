import { INTERVIEW_ROUNDS_RAW } from "@/content/interview-data";
import type { InterviewCodeBlock, InterviewQuestionRaw, InterviewRoundRaw } from "@/content/interview-types";
import type { Chapter, NotesFile } from "@/content/types";

/** A round is "bulk" when its single card is actually a checklist of many
 * sub-questions (the rapid-fire rounds) — counting it as one card badly
 * undersells how much ground it covers. */
const BULK_TITLE = /rapid-fire|the rest of|the ten numbers|implementations they ask|say out loud/i;

function codeBlocksHTML(blocks: InterviewCodeBlock | InterviewCodeBlock[] | undefined): string {
  if (!blocks) return "";
  const arr = Array.isArray(blocks) ? blocks : [blocks];
  // Plain <pre><code> — the reader shell wraps every bare <pre> in a
  // .codeblock with a copy button itself, on every navigation.
  return arr
    .map((b) => (b.label ? `<div class="codelabel">${b.label}</div>` : "") + `<pre><code>${b.code}</code></pre>`)
    .join("");
}

function questionHTML(q: InterviewQuestionRaw, roundId: string, i: number): string {
  let h = `<div class="q">`;
  h += `<div class="qtop">`;
  h += `<div class="qnum">${roundId.toUpperCase().replace(/^R/, "")}.${i}</div>`;
  h += `<div class="qt">${q.q}</div>`;
  h += `</div>`;
  h += `<div class="qbody">`;
  if (q.test) h += `<div class="test"><span class="ttl">What they are really testing</span>${q.test}</div>`;
  if (q.a) h += q.a;
  if (q.code) h += codeBlocksHTML(q.code);
  if (q.say) h += `<div class="say"><span class="ttl">Say it like this</span>${q.say}</div>`;
  if (q.trap) h += `<div class="warn"><span class="ttl">The answer that loses the room</span>${q.trap}</div>`;
  if (q.note) h += `<div class="sticky mint"><span class="ttl">2026 note</span>${q.note}</div>`;
  if (q.after) h += q.after;
  if (q.fu && q.fu.length)
    h += `<div class="followups"><span class="ttl">They will push with</span><ul><li>${q.fu.join("</li><li>")}</li></ul></div>`;
  h += `</div></div>`;
  return h;
}

/** The count shown against a round — bulk rounds count their list items
 * rather than the single card that holds them. */
function questionCount(round: InterviewRoundRaw): number {
  return round.qs.reduce((sum, q) => {
    if (BULK_TITLE.test(q.q)) {
      const items = (q.a?.match(/<li>/g) || []).length;
      if (items > 0) return sum + items;
    }
    return sum + 1;
  }, 0);
}

/** A round's content, without the chapter shell (title/badge/prev-next) —
 * ChapterSheet already supplies that from the Chapter fields below. */
function roundBodyHTML(round: InterviewRoundRaw): string {
  let h = `<div class="interview-body">`;
  if (round.meta && round.meta.length) {
    h += `<div class="rmeta">`;
    round.meta.forEach(([k, v]) => {
      h += `<div><span class="k">${k}</span><span class="v">${v}</span></div>`;
    });
    h += `</div>`;
  }
  if (round.tiers && round.tiers.length) {
    h += `<div class="tiers">`;
    h += round.tiers.map(([name, hot]) => `<span class="tier${hot ? " hot" : ""}">${name}</span>`).join("");
    h += `</div>`;
  }
  if (round.intro) h += `<p class="rintro">${round.intro}</p>`;
  if (round.pre) h += round.pre;
  round.qs.forEach((q, i) => {
    h += questionHTML(q, round.id, i + 1);
  });
  if (round.post) h += round.post;
  h += `</div>`;
  return h;
}

function toChapter(round: InterviewRoundRaw): Chapter {
  return {
    id: round.id,
    num: round.code,
    title: round.title,
    short: round.navTitle,
    // The reader shell groups chapters by level — a natural fit for the
    // ₹20–28L core loop (read in order, no tiering) versus the ₹50L+ staff
    // track (lv: 2), so that split becomes the Beginner/Advanced grouping
    // in the sidebar instead of a bespoke track filter.
    levels: [round.lv === 2 ? "advanced" : "beginner"],
    practice: [],
    ready: true,
    subtitle: "",
    body: roundBodyHTML(round),
  };
}

export const INTERVIEW_CHAPTERS: Chapter[] = INTERVIEW_ROUNDS_RAW.map(toChapter);

export const interviewNotes: NotesFile = {
  meta: {
    title: "Interview — the whole loop",
    subtitle: "Every round, every question, the answer, the code, and the follow-up they push with next.",
    lead: "Twelve rounds, in the order you meet them, plus the scouting report on how your own resume reads from the other side of the table and a week-before prep plan — the ₹20–28L core loop. Under Advanced: the ₹50L+ staff track, for the two-jump plan to get there.",
    author: "Akshat",
    updated: "September 2026",
  },
  hero: { figure: "" },
  chapters: INTERVIEW_CHAPTERS,
};

export const INTERVIEW_TOTAL_ROUNDS = INTERVIEW_ROUNDS_RAW.length;
export const INTERVIEW_TOTAL_QUESTIONS = INTERVIEW_ROUNDS_RAW.reduce((sum, r) => sum + questionCount(r), 0);
