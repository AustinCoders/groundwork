import { skillCounts } from "./skills";
import type { ParsedResume, ResumeLink, ResumeProject, ResumeRole, ResumeSection, SectionId, YearMonth } from "./types";

const HEADINGS: [SectionId, RegExp][] = [
  ["objective", /^(career\s+)?objective$/],
  [
    "summary",
    /^(professional\s+|career\s+|executive\s+)?(summary|profile)$|^about(\s+me)?$|^profile\s+summary$|^overview$/,
  ],
  [
    "experience",
    /^(professional\s+|work\s+|relevant\s+|industry\s+)?experience$|^employment(\s+history)?$|^work\s+history$|^career\s+history$|^experience\s+summary$/,
  ],
  ["projects", /^(key\s+|personal\s+|academic\s+|selected\s+|side\s+)?projects$|^project\s+experience$/],
  [
    "skills",
    /^(technical\s+|core\s+|key\s+)?skills(\s+(&|and)\s+tools)?$|^(technical|tech)\s+stack$|^technologies$|^tools(\s+(&|and)\s+technologies)?$|^skills\s+summary$/,
  ],
  ["education", /^education(al)?(\s+(background|qualifications?))?$|^academics?$|^qualifications?$/],
  [
    "certifications",
    /^certifications?(\s+(&|and)\s+courses)?$|^courses$|^(licences|licenses)(\s+(&|and)\s+certifications)?$/,
  ],
  ["achievements", /^(key\s+)?achievements$|^awards(\s+(&|and)\s+achievements)?$|^accomplishments$|^(honours|honors)$/],
  ["personal", /^personal\s+(details|information|profile|data)$/],
  ["declaration", /^declaration$/],
  ["interests", /^(hobbies|interests)(\s+(&|and)\s+(hobbies|interests))?$/],
  ["languages", /^languages(\s+known)?$/],
];

const BULLET = /^[•●▪◦‣∙·\-–*►■□✓✔➢➤>]\s*/;

const MON =
  "january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec";
const TOKEN = `(?:(?:${MON})\\.?[\\s,']*(?:\\d{4}|'?\\d{2})(?!\\d)|\\d{1,2}[/.\\-]\\d{4}|(?:19|20)\\d{2})`;
const END = "(?:present|current(?:ly)?|now|today|ongoing|till\\s+(?:date|now)|to\\s+date|date)";
const RANGE = new RegExp(`(${TOKEN})\\s*(?:-|–|—|to|till|until|→)\\s*(${TOKEN}|${END})`, "i");

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,5}/;
const URL =
  /(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.(?:com|in|io|dev|me|app|co|org|net|tech|xyz|site|page)(?:\/[^\s|,;]*)?/gi;

export function cleanLine(line: string): string {
  return line
    .replace(/ /g, " ")
    .replace(/[​-‍﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isBullet(line: string): boolean {
  return BULLET.test(line) && !/^[-–—]\s*(?:\d{4}|present|current)/i.test(line);
}

export function stripBullet(line: string): string {
  return line.replace(BULLET, "").trim();
}

export function headingFor(line: string): SectionId | null {
  const plain = line
    .replace(/[:：|•\-–—_=*#]+$/g, "")
    .replace(/^[|•\-–—_=*#]+/g, "")
    .trim()
    .toLowerCase();
  if (!plain || plain.split(/\s+/).length > 5) return null;
  for (const [id, pattern] of HEADINGS) if (pattern.test(plain)) return id;
  return null;
}

function parseToken(raw: string): YearMonth | null {
  const text = raw.trim().toLowerCase();
  const numeric = text.match(/^(\d{1,2})[/.\-](\d{4})$/);
  if (numeric) {
    const m = Number(numeric[1]);
    return m >= 1 && m <= 12 ? { y: Number(numeric[2]), m } : { y: Number(numeric[2]), m: 0 };
  }
  const year = text.match(/^(?:19|20)\d{2}$/);
  if (year) return { y: Number(text), m: 0 };
  const named = text.match(new RegExp(`^(${MON})\\.?[\\s,']*('?\\d{2}|\\d{4})$`));
  if (named) {
    const m = MONTHS.indexOf(named[1].slice(0, 3)) + 1;
    const digits = named[2].replace("'", "");
    const y = digits.length === 2 ? 2000 + Number(digits) : Number(digits);
    return { y, m };
  }
  return null;
}

export interface DateRange {
  text: string;
  start: YearMonth | null;
  end: YearMonth | null;
  current: boolean;
}

export function findRange(line: string): DateRange | null {
  const match = line.match(RANGE);
  if (!match) return null;
  const current = new RegExp(`^${END}$`, "i").test(match[2].trim());
  return {
    text: match[0],
    start: parseToken(match[1]),
    end: current ? null : parseToken(match[2]),
    current,
  };
}

export function monthIndex(value: YearMonth, endOfYear = false): number {
  return value.y * 12 + (value.m > 0 ? value.m - 1 : endOfYear ? 11 : 0);
}

function headingOf(line: string, range: DateRange): string {
  return line
    .replace(range.text, " ")
    .replace(/\s*[|,•·–—-]\s*$/g, "")
    .replace(/^\s*[|,•·–—-]\s*/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeHeadline(line: string): boolean {
  return !isBullet(line) && line.split(/\s+/).length <= 10 && !/[.;]$/.test(line);
}

const DANGLING =
  /\b(?:to|and|or|the|of|from|by|with|for|in|on|a|an|at|into|across|using|via|than|while|that|which|over|per|&)$/i;

function continues(previous: string, line: string): boolean {
  if (/[.!?]$/.test(previous)) return false;
  if (findRange(line) || headingFor(line) || isBullet(line)) return false;
  if (/^[a-z0-9(&,%$₹–-]/.test(line)) return true;
  return DANGLING.test(previous);
}

function readRoles(lines: string[]): ResumeRole[] {
  const roles: ResumeRole[] = [];
  let pending: string[] = [];
  let role: ResumeRole | null = null;
  let headlineOpen = false;

  lines.forEach((line, index) => {
    const range = findRange(line);
    const next = lines[index + 1];
    const nextRange = next ? findRange(next) : null;
    if (!range && !isBullet(line) && nextRange && headingOf(next, nextRange).length < 3 && looksLikeHeadline(line)) {
      pending.push(line);
      return;
    }
    if (range) {
      const own = headingOf(line, range);
      const parts = [...pending.slice(-2), own].filter(Boolean);
      role = {
        heading: parts.join(" · "),
        dateText: range.text,
        start: range.start,
        end: range.end,
        current: range.current,
        bullets: [],
      };
      roles.push(role);
      pending = [];
      headlineOpen = true;
      return;
    }
    if (!role) {
      if (looksLikeHeadline(line)) pending.push(line);
      return;
    }
    if (isBullet(line)) {
      headlineOpen = false;
      role.bullets.push(stripBullet(line));
      return;
    }
    const last = role.bullets.length - 1;
    if (headlineOpen && role.bullets.length === 0 && looksLikeHeadline(line)) {
      role.heading = role.heading ? `${role.heading} · ${line}` : line;
      headlineOpen = role.heading.split(" · ").length < 3;
      return;
    }
    if (last >= 0 && continues(role.bullets[last], line)) {
      role.bullets[last] = `${role.bullets[last]} ${line}`;
      return;
    }
    if (line.split(/\s+/).length >= 6 && !(/\s[|–—]\s/.test(line) && looksLikeHeadline(line))) {
      headlineOpen = false;
      role.bullets.push(line);
      return;
    }
    pending.push(line);
  });
  return roles;
}

function readProjects(lines: string[]): ResumeProject[] {
  const projects: ResumeProject[] = [];
  let current: ResumeProject | null = null;
  for (const line of lines) {
    if (isBullet(line)) {
      if (!current) {
        current = { name: "", bullets: [] };
        projects.push(current);
      }
      current.bullets.push(stripBullet(line));
      continue;
    }
    const last = current ? current.bullets.length - 1 : -1;
    if (current && last >= 0 && continues(current.bullets[last], line)) {
      current.bullets[last] = `${current.bullets[last]} ${line}`;
      continue;
    }
    if (looksLikeHeadline(line)) {
      current = { name: line.replace(/\s*[|–—-]\s*$/, ""), bullets: [] };
      projects.push(current);
      continue;
    }
    if (!current) {
      current = { name: "", bullets: [] };
      projects.push(current);
    }
    current.bullets.push(line);
  }
  return projects.filter((p) => p.name || p.bullets.length);
}

function readLinks(text: string): ResumeLink[] {
  const found = new Map<string, ResumeLink>();
  const withoutEmails = text.replace(new RegExp(EMAIL.source, "g"), " ");
  for (const raw of withoutEmails.match(URL) ?? []) {
    const url = raw.replace(/[).,;]+$/, "");
    const lower = url.toLowerCase();
    if (lower.length < 6 || /^\d/.test(lower)) continue;
    const kind: ResumeLink["kind"] = lower.includes("linkedin.com")
      ? "linkedin"
      : lower.includes("github.com")
        ? "github"
        : "site";
    if (kind === "site" && !/\/|^(https?:|www\.)/.test(lower) && !/\.(dev|io|me|app|site|page)$/.test(lower)) continue;
    const key = lower.replace(/^https?:\/\//, "").replace(/^www\./, "");
    if (!found.has(key)) found.set(key, { kind, url });
  }
  return [...found.values()].slice(0, 8);
}

function readName(lines: string[]): string {
  for (const line of lines.slice(0, 6)) {
    if (headingFor(line)) break;
    const candidate = line.split(/\s*[|•·]\s*/)[0].trim();
    if (EMAIL.test(candidate) || /\d/.test(candidate)) continue;
    const words = candidate.split(/\s+/);
    if (words.length < 2 || words.length > 4) continue;
    if (!words.every((word) => /^[\p{L}][\p{L}.'-]*$/u.test(word))) continue;
    return words.map((word) => (word === word.toUpperCase() ? word[0] + word.slice(1).toLowerCase() : word)).join(" ");
  }
  return "";
}

function experienceMonths(roles: ResumeRole[], now: YearMonth): number | null {
  const spans: [number, number][] = [];
  for (const role of roles) {
    if (!role.start) continue;
    const start = monthIndex(role.start);
    const end = role.current ? monthIndex(now) : role.end ? monthIndex(role.end, true) : null;
    if (end === null || end < start) continue;
    spans.push([start, end]);
  }
  if (!spans.length) return null;
  spans.sort((a, b) => a[0] - b[0]);
  let total = 0;
  let [from, to] = spans[0];
  for (const [s, e] of spans.slice(1)) {
    if (s <= to + 1) to = Math.max(to, e);
    else {
      total += to - from + 1;
      [from, to] = [s, e];
    }
  }
  total += to - from + 1;
  return total;
}

export interface ParseInput {
  lines: string[];
  pages: number;
  wideGaps?: number;
  links?: string[];
  now?: YearMonth;
}

export function parseResume(input: ParseInput): ParsedResume {
  const now = input.now ?? { y: new Date().getFullYear(), m: new Date().getMonth() + 1 };
  const lines = input.lines.map(cleanLine).filter(Boolean);
  const text = lines.join("\n");

  const sections: ResumeSection[] = [];
  let current: ResumeSection = { id: "other", title: "", lines: [] };
  for (const line of lines) {
    const id = headingFor(line);
    if (id) {
      if (current.lines.length || current.title) sections.push(current);
      current = { id, title: line.replace(/[:：]\s*$/, ""), lines: [] };
      continue;
    }
    current.lines.push(line);
  }
  if (current.lines.length || current.title) sections.push(current);

  const experienceLines = sections.filter((s) => s.id === "experience").flatMap((s) => s.lines);
  const roles = readRoles(
    experienceLines.length
      ? experienceLines
      : sections.filter((s) => s.id === "other" || s.id === "summary").flatMap((s) => s.lines)
  );
  const projects = readProjects(sections.filter((s) => s.id === "projects").flatMap((s) => s.lines));
  const achievements = sections
    .filter((s) => s.id === "achievements")
    .flatMap((s) => s.lines)
    .map(stripBullet);

  const counts = skillCounts(text);
  const skills = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);

  const email = text.match(EMAIL)?.[0] ?? null;
  const phoneText = lines.slice(0, 12).join(" ").replace(new RegExp(EMAIL.source, "g"), " ");
  const phoneMatch = phoneText.match(PHONE)?.[0] ?? null;
  const phone = phoneMatch && phoneMatch.replace(/\D/g, "").length >= 10 ? phoneMatch.trim() : null;

  return {
    name: readName(lines),
    email,
    phone,
    links: readLinks([text, ...(input.links ?? [])].join("\n")),
    sections,
    roles,
    projects,
    bullets: [...roles.flatMap((r) => r.bullets), ...projects.flatMap((p) => p.bullets), ...achievements].filter(
      (b) => b.length > 2
    ),
    skills,
    words: text.split(/\s+/).filter(Boolean).length,
    pages: input.pages,
    months: experienceMonths(roles, now),
    wideGaps: input.wideGaps ?? 0,
  };
}
