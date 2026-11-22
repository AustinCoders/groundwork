import { findRange, monthIndex } from "./parse";
import { skillById } from "./skills";
import { WEAK_OPENER, clip, metricIn } from "./text";
import type { FixSeverity, ParsedResume, ResumeFix } from "./types";

const PERSONAL =
  /\b(?:date\s+of\s+birth|d\.?o\.?b\.?|marital\s+status|father'?s\s+name|mother'?s\s+name|gender|religion|nationality|caste|passport\s+no)\b/i;
const BUZZWORDS =
  /\b(?:hard[\s-]?working|team\s+player|go[\s-]?getter|self[\s-]?motivated|result[\s-]?oriented|dynamic|synergy|passionate|detail[\s-]?oriented|quick\s+learner|out[\s-]of[\s-]the[\s-]box)\b/gi;
const FIRST_PERSON = /\b(?:I|my|me|myself)\b/;

function fix(
  id: string,
  severity: FixSeverity,
  title: string,
  detail: string,
  quotes: string[] = [],
  suggestion?: string
): ResumeFix {
  return { id, severity, title, detail, quotes: quotes.slice(0, 4), suggestion };
}

export function buildFixes(parsed: ParsedResume, missing: string[], now: { y: number; m: number }): ResumeFix[] {
  const out: ResumeFix[] = [];
  const all = parsed.sections.flatMap((s) => s.lines);
  const text = all.join("\n");
  const has = (id: string) => parsed.sections.some((s) => s.id === id);
  const programmer = parsed.skills.some((id) => {
    const kind = skillById(id)?.kind;
    return kind === "language" || kind === "frontend" || kind === "backend";
  });

  if (parsed.words < 120) {
    out.push(
      fix(
        "little-text",
        "high",
        "Very little text could be read",
        "Only a few words came out of this file. It is probably a scanned image or text drawn as shapes. Applicant tracking systems (ATS) read files the same way, so they may see an empty resume. Export it again from Word, Google Docs or your editor as a text PDF."
      )
    );
  }
  if (parsed.wideGaps >= 8) {
    out.push(
      fix(
        "columns",
        "medium",
        "Two columns or a table layout",
        "Many lines have text far apart on the same row, which usually means columns or tables. Some ATS read across the columns and mix your sentences. A single-column layout is the safe choice."
      )
    );
  }
  if (!parsed.email || !parsed.phone) {
    out.push(
      fix(
        "contact",
        "high",
        `Add your ${!parsed.email && !parsed.phone ? "email and phone number" : !parsed.email ? "email" : "phone number"}`,
        "Recruiters need to reach you in one click. Put them in the first two lines, as plain text, not inside an image or a header field."
      )
    );
  }
  if (!parsed.links.some((l) => l.kind === "linkedin")) {
    out.push(
      fix(
        "linkedin",
        "low",
        "Add your LinkedIn profile",
        "Most recruiters in India check LinkedIn before they call. Use the short /in/your-name address."
      )
    );
  }
  if (programmer && !parsed.links.some((l) => l.kind === "github" || l.kind === "site")) {
    out.push(
      fix(
        "github",
        "low",
        "Add a GitHub or portfolio link",
        "For developer roles a link to real code or a live project is often the deciding detail between two similar resumes."
      )
    );
  }
  if (!has("experience") && parsed.roles.length === 0) {
    out.push(
      fix(
        "no-experience",
        "medium",
        "No experience section was found",
        "Use a heading named “Experience” or “Work Experience”, so both people and ATS find it. If you are a fresher, put internships and projects under clear headings instead."
      )
    );
  }
  if (!has("skills")) {
    out.push(
      fix(
        "no-skills",
        "medium",
        "Add a Skills section",
        "A short “Skills” section, grouped as Languages, Frontend, Backend, Data and Cloud, is the first place ATS keyword search looks."
      )
    );
  }
  const objective = parsed.sections.find((s) => s.id === "objective");
  if (objective) {
    out.push(
      fix(
        "objective",
        "medium",
        "Replace the objective with a two-line summary",
        "An objective says what you want. A summary says what you bring, which is what the reader is deciding on.",
        objective.lines.slice(0, 1),
        "Full stack developer with 5 years in TypeScript, React and Node.js. Owned checkout and payments at a high-traffic e-commerce company; cut p95 latency by 77%."
      )
    );
  }
  const personal = all.filter((line) => PERSONAL.test(line));
  if (personal.length || has("personal")) {
    out.push(
      fix(
        "personal",
        "medium",
        "Remove personal details",
        "Date of birth, marital status, parents’ names, gender and religion are not needed to judge your work, take space, and can invite bias. Most product companies in India do not expect them.",
        personal
      )
    );
  }
  if (has("declaration") || /\bhereby\s+declare\b/i.test(text)) {
    out.push(
      fix(
        "declaration",
        "low",
        "Remove the declaration",
        "“I hereby declare that the above information is true…” adds nothing. Use the line for one more result instead."
      )
    );
  }

  const weak = parsed.bullets.filter((b) => WEAK_OPENER.test(b));
  if (weak.length) {
    out.push(
      fix(
        "weak-verbs",
        "medium",
        "Start bullets with what you did, not what you were near",
        "“Responsible for”, “worked on” and “helped” hide your part. Start with a strong verb, say what you changed, and end with the result.",
        weak,
        "Built the Razorpay and Stripe integration with signed webhooks and idempotent refunds; payment failures dropped from 2.1% to 0.6%."
      )
    );
  }
  const bullets = parsed.bullets.filter((b) => b.split(/\s+/).length >= 5);
  const withNumbers = bullets.filter((b) => metricIn(b));
  if (bullets.length >= 4 && withNumbers.length / bullets.length < 0.4) {
    out.push(
      fix(
        "numbers",
        "medium",
        `Only ${withNumbers.length} of ${bullets.length} bullets have a number`,
        "Numbers make a bullet believable: users, requests, latency, money, time saved, team size. Add one where you honestly know it, and be ready to say how you measured it.",
        bullets.filter((b) => !metricIn(b))
      )
    );
  }
  const long = parsed.bullets.filter((b) => b.split(/\s+/).length > 35);
  if (long.length) {
    out.push(
      fix(
        "long-bullets",
        "low",
        "Some bullets are too long",
        "Readers skim. Keep a bullet under about 25 words; split one that tells two stories.",
        long.map((b) => clip(b, 18))
      )
    );
  }
  const firstPerson = parsed.bullets.filter((b) => FIRST_PERSON.test(b));
  if (firstPerson.length) {
    out.push(
      fix(
        "first-person",
        "low",
        "Drop “I” and “my” from bullets",
        "Resume bullets are written without the subject: “Built…”, not “I built…”.",
        firstPerson.map((b) => clip(b, 14))
      )
    );
  }
  const buzz = [...new Set((text.match(BUZZWORDS) ?? []).map((w) => w.toLowerCase()))];
  if (buzz.length) {
    out.push(
      fix(
        "buzzwords",
        "low",
        "Swap adjectives for evidence",
        `Words like ${buzz
          .slice(0, 4)
          .map((w) => `“${w}”`)
          .join(", ")} are on almost every resume and prove nothing. Show it with a result instead.`
      )
    );
  }

  const years = (parsed.months ?? 0) / 12;
  if (parsed.pages > 2 || parsed.words > 1100) {
    out.push(
      fix(
        "length",
        "medium",
        "Cut it to two pages",
        `This resume is ${parsed.pages} page${parsed.pages === 1 ? "" : "s"} and about ${parsed.words} words. Two pages is as much as most readers will read; keep the last 5 years in detail and shorten the rest.`
      )
    );
  } else if (parsed.pages === 2 && parsed.months !== null && years < 4) {
    out.push(
      fix(
        "one-page",
        "low",
        "One page is enough at your experience",
        "Under about four years, one tight page reads better than two loose ones."
      )
    );
  }

  const undated = parsed.roles.filter((r) => !r.start);
  if (undated.length) {
    out.push(
      fix(
        "undated",
        "medium",
        "Some roles have no readable dates",
        "Write dates as “Mar 2023 – Present” on the same line as the role, so ATS and people can follow your timeline.",
        undated.map((r) => r.heading)
      )
    );
  }
  const future = parsed.roles.filter((r) => r.end && monthIndex(r.end) > monthIndex(now));
  if (future.length) {
    out.push(
      fix(
        "future-date",
        "high",
        "An end date is in the future",
        "A role cannot end after today. Check the year.",
        future.map((r) => `${r.heading} · ${r.dateText}`)
      )
    );
  }
  const current = parsed.roles.filter((r) => r.current);
  if (current.length > 1) {
    out.push(
      fix(
        "two-current",
        "low",
        "More than one role says “Present”",
        "If both are real (a job and freelance work), label the second one as part-time or freelance. If one has ended, give it an end date.",
        current.map((r) => `${r.heading} · ${r.dateText}`)
      )
    );
  }
  const styles = new Set(
    parsed.roles
      .map((r) => findRange(r.dateText)?.text ?? "")
      .map((t) =>
        /\d{1,2}[/.-]\d{4}/.test(t)
          ? "numeric"
          : /[a-z]{3}/i.test(t.replace(/present|current|now|till|date|to/gi, ""))
            ? "named"
            : "year"
      )
  );
  if (styles.size > 1) {
    out.push(
      fix(
        "date-format",
        "low",
        "Use one date format",
        "Mixing “03/2023” and “Mar 2023” looks careless. Pick one style for every role."
      )
    );
  }
  const skillsSection = parsed.sections.find((s) => s.id === "skills");
  if (skillsSection) {
    const items = skillsSection.lines
      .join(",")
      .replace(/^[^:]*:/gm, "")
      .split(/[,|•·/]/)
      .filter((x) => x.trim().length > 1);
    if (items.length > 30) {
      out.push(
        fix(
          "skill-dump",
          "low",
          `${items.length} skills is too many`,
          "A long list reads as “has touched everything”. Keep the ones you could be questioned on today, grouped by area."
        )
      );
    }
  }
  const doubled = text.match(/\b(\w{2,})\s+\1\b/i);
  if (doubled) {
    out.push(
      fix("repeat-word", "low", "A word is repeated", "Look for the doubled word and remove one.", [doubled[0]])
    );
  }
  if (missing.length) {
    const names = missing.map((id) => skillById(id)?.name ?? id);
    out.push(
      fix(
        "jd-keywords",
        "medium",
        "Keywords from the job description are missing",
        `The job description mentions ${names.join(", ")}, and your resume does not. Add the ones you have really used, in the bullet where you used them, because recruiters search for these exact words. Do not add the rest: the questions tab prepares you to answer for them honestly.`
      )
    );
  }

  const order: Record<FixSeverity, number> = { high: 0, medium: 1, low: 2 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}
