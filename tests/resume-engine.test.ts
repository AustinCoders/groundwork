import { describe, expect, it } from "vitest";
import { analyzeResume } from "@/lib/resume/analyze";
import { buildCatalogue } from "@/lib/resume/catalogue";
import { docxText } from "@/lib/resume/docx";
import { fileKind } from "@/lib/resume/extract";
import { findRange, headingFor, isBullet, parseResume } from "@/lib/resume/parse";
import { SAMPLE_JD, SAMPLE_RESUME_LINES } from "@/lib/resume/sample";
import { skillsIn } from "@/lib/resume/skills";
import { metricIn, orgOf } from "@/lib/resume/text";
import { bookRounds } from "@/lib/interviewBook";

const NOW = { y: 2026, m: 11 };
const catalogue = buildCatalogue();
const sample = () => analyzeResume({ lines: [...SAMPLE_RESUME_LINES], pages: 1, jd: SAMPLE_JD, catalogue, now: NOW });

describe("resume parsing", () => {
  it("reads the common date range styles", () => {
    expect(findRange("Mar 2023 – Present")).toMatchObject({ start: { y: 2023, m: 3 }, current: true });
    expect(findRange("Engineer, Acme  08/2021 - 12/2022")).toMatchObject({
      start: { y: 2021, m: 8 },
      end: { y: 2022, m: 12 },
    });
    expect(findRange("Sept '19 to Jan '21")).toMatchObject({ start: { y: 2019, m: 9 }, end: { y: 2021, m: 1 } });
    expect(findRange("2018 — 2020")).toMatchObject({ start: { y: 2018, m: 0 }, end: { y: 2020, m: 0 } });
    expect(findRange("Jan 2024 till date")).toMatchObject({ current: true });
    expect(findRange("Handled 2,000 requests a day")).toBeNull();
  });

  it("knows headings and bullets", () => {
    expect(headingFor("WORK EXPERIENCE")).toBe("experience");
    expect(headingFor("Technical Skills:")).toBe("skills");
    expect(headingFor("Career Objective")).toBe("objective");
    expect(headingFor("I built a cache for the experience team")).toBeNull();
    expect(isBullet("• Built a cache")).toBe(true);
    expect(isBullet("- 40% faster pages")).toBe(true);
    expect(isBullet("– 2021")).toBe(false);
  });

  it("splits the sample into contact details, roles and projects", () => {
    const parsed = parseResume({ lines: [...SAMPLE_RESUME_LINES], pages: 1, now: NOW });
    expect(parsed.name).toBe("Riya Sharma");
    expect(parsed.email).toBe("riya.sharma.dev@example.com");
    expect(parsed.phone).toBe("+91 98765 43210");
    expect(parsed.links.map((l) => l.kind)).toEqual(["linkedin", "github"]);
    expect(parsed.roles.map((r) => orgOf(r.heading))).toEqual([
      "Cartwheel Commerce",
      "Bluebell Labs",
      "Pixelcraft Studio",
    ]);
    expect(parsed.roles[0].current).toBe(true);
    expect(parsed.roles[0].bullets).toHaveLength(4);
    expect(parsed.roles[1].bullets).toHaveLength(3);
    expect(parsed.projects).toHaveLength(1);
    expect(parsed.months).toBe(69);
    expect(parsed.skills).toEqual(expect.arrayContaining(["react", "nestjs", "redis", "postgres", "aws", "docker"]));
  });

  it("joins a bullet that wrapped onto the next line, even when the next line starts with a number", () => {
    const parsed = parseResume({
      lines: [
        "EXPERIENCE",
        "Senior Engineer — Skyline Tech",
        "Aug 2023 – Present",
        "• Introduced Redis cache-aside, cutting p95 latency from 900ms to",
        "180ms.",
        "• Built the release pipeline with",
        "GitHub Actions and Docker.",
        "Software Engineer — Shopnest",
        "Apr 2022 – Jun 2023",
        "• Migrated 15 pages to Next.js SSR.",
      ],
      pages: 1,
      now: NOW,
    });
    expect(parsed.roles[0].bullets).toEqual([
      "Introduced Redis cache-aside, cutting p95 latency from 900ms to 180ms.",
      "Built the release pipeline with GitHub Actions and Docker.",
    ]);
    expect(parsed.roles[1].heading).toBe("Software Engineer — Shopnest");
  });

  it("does not mistake ordinary words for skills", () => {
    expect(skillsIn("The rest of the team joined the hiring drive and processes ran on time")).toEqual([]);
    expect(skillsIn("Built REST APIs in Go and Java, not JavaScript")).toEqual(
      expect.arrayContaining(["rest", "java", "javascript"])
    );
    expect(skillsIn("Wrote Java services")).not.toContain("javascript");
  });

  it("finds the number in a bullet", () => {
    expect(metricIn("cutting p95 latency from 1.8s to 420ms.")).toBe("from 1.8s to 420ms");
    expect(metricIn("took read load down 62% during sales")).toBe("62%");
    expect(metricIn("Saved ₹4 lakh a year")).toBe("₹4 lakh");
    expect(metricIn("deploys went from 4 hours to 15 minutes")).toBe("from 4 hours to 15 minutes");
    expect(orgOf("Senior Software Engineer — Skyline Tech (Remote)")).toBe("Skyline Tech");
    expect(metricIn("Worked on the dashboard")).toBeNull();
  });
});

describe("resume analysis", () => {
  it("asks about the numbers, the vague bullets, the roles and the job description gaps", () => {
    const result = sample();
    const groups = new Set(result.questions.map((q) => q.group));
    expect([...groups]).toEqual(expect.arrayContaining(["deep-dive", "roles", "projects", "skills", "gaps", "people"]));
    expect(result.questions.some((q) => q.q.includes("from 1.8s to 420ms"))).toBe(true);
    expect(result.questions.some((q) => q.q.startsWith("You wrote “Responsible for"))).toBe(true);
    expect(result.questions.some((q) => q.q.includes("still at Cartwheel Commerce"))).toBe(true);
    expect(result.missing).toEqual(expect.arrayContaining(["kubernetes", "queues"]));
    expect(result.questions.some((q) => q.group === "gaps" && q.skill === "kubernetes")).toBe(true);
    expect(new Set(result.questions.map((q) => q.id)).size).toBe(result.questions.length);
  });

  it("flags the fixes an Indian resume often needs", () => {
    const ids = sample().fixes.map((f) => f.id);
    expect(ids).toEqual(expect.arrayContaining(["objective", "personal", "declaration", "weak-verbs", "jd-keywords"]));
    expect(ids).not.toContain("contact");
    expect(ids).not.toContain("little-text");
  });

  it("warns about an almost empty file, gaps and a future end date", () => {
    const thin = analyzeResume({ lines: ["Riya Sharma", "Resume"], pages: 1, catalogue, now: NOW });
    expect(thin.fixes[0].id).toBe("little-text");
    const gappy = analyzeResume({
      lines: [
        "EXPERIENCE",
        "Engineer | Acme",
        "Jan 2020 – Dec 2020",
        "• Built the billing service for 300 merchants.",
        "Engineer | Zeta",
        "Jun 2021 – Mar 2027",
        "• Led the move to Postgres.",
      ],
      pages: 1,
      catalogue,
      now: NOW,
    });
    expect(gappy.questions.some((q) => q.q.startsWith("There is a gap from Dec 2020 to Jun 2021"))).toBe(true);
    expect(gappy.fixes.some((f) => f.id === "future-date")).toBe(true);
  });

  it("points study links only at written chapters or interview rounds", () => {
    for (const item of sample().study)
      expect(item.href).toMatch(/^\/(notes|react|dsa|system-design|git|level\/dsa|interview\/[a-z0-9]+)$/);
  });
});

describe("question catalogue", () => {
  it("links every question to a real page and keeps markup out", () => {
    const rounds = new Set(bookRounds().map((r) => r.id));
    expect(catalogue.questions.length).toBeGreaterThan(200);
    for (const q of catalogue.questions) {
      expect(q.q).not.toMatch(/<[a-z]/i);
      expect(q.href).toMatch(/^\/(interview|company-questions)\//);
      const round = q.href.match(/^\/interview\/([^#]+)#/)?.[1];
      if (round) expect(rounds.has(round)).toBe(true);
    }
  });

  it("stays small enough to fetch after an upload", () => {
    expect(JSON.stringify(catalogue).length).toBeLessThan(120_000);
  });
});

describe("file reading", () => {
  it("accepts only PDF and Word files", () => {
    expect(fileKind({ name: "CV.PDF", type: "" })).toBe("pdf");
    expect(fileKind({ name: "cv.docx", type: "" })).toBe("docx");
    expect(fileKind({ name: "cv.doc", type: "application/msword" })).toBeNull();
    expect(fileKind({ name: "cv.png", type: "image/png" })).toBeNull();
  });

  it("reads paragraphs, list items, links and page count from a Word document", () => {
    const xml =
      "<w:document><w:body><w:p><w:r><w:t>Riya Sharma</w:t></w:r></w:p>" +
      '<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">Built R&amp;D tools </w:t></w:r><w:r><w:t>for 40 people</w:t></w:r></w:p>' +
      "<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Skills</w:t></w:r></w:p></w:tc></w:tr></w:tbl></w:body></w:document>";
    const rels =
      '<Relationships><Relationship Id="r1" Type="http://schemas/hyperlink" Target="https://linkedin.com/in/riya" TargetMode="External"/></Relationships>';
    const read = docxText(xml, rels, "<Properties><Pages>2</Pages></Properties>");
    expect(read.lines).toEqual(["Riya Sharma", "• Built R&D tools for 40 people", "Skills"]);
    expect(read.links).toEqual(["https://linkedin.com/in/riya"]);
    expect(read.tables).toBe(1);
    expect(read.pages).toBe(2);
  });
});
