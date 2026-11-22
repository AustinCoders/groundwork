import { isPlainObject } from "@/lib/storage";

export const AVATAR_COLORS = ["blue", "purple", "green", "orange", "red"] as const;

export type AvatarColor = (typeof AVATAR_COLORS)[number];

export interface ProfileExtras {
  headline: string;
  location: string;
  github: string;
  linkedin: string;
  website: string;
  avatarColor: AvatarColor;
}

export const EMPTY_EXTRAS: ProfileExtras = {
  headline: "",
  location: "",
  github: "",
  linkedin: "",
  website: "",
  avatarColor: "blue",
};

const LIMITS = { headline: 80, location: 60, github: 39, linkedin: 100, website: 200 };

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function readExtras(meta: unknown): ProfileExtras {
  const m = isPlainObject(meta) ? meta : {};
  const color = AVATAR_COLORS.find((c) => c === m.avatar_color) ?? "blue";
  return {
    headline: text(m.headline, LIMITS.headline),
    location: text(m.location, LIMITS.location),
    github: text(m.github, LIMITS.github),
    linkedin: text(m.linkedin, LIMITS.linkedin),
    website: text(m.website, LIMITS.website),
    avatarColor: color,
  };
}

export function extrasToMetadata(extras: ProfileExtras): Record<string, string> {
  return {
    headline: extras.headline.trim(),
    location: extras.location.trim(),
    github: extras.github.trim().replace(/^@/, ""),
    linkedin: withScheme(extras.linkedin),
    website: withScheme(extras.website),
    avatar_color: extras.avatarColor,
  };
}

function withScheme(value: string): string {
  const trimmed = value.trim();
  return trimmed && !/^[a-z]+:/i.test(trimmed) ? `https://${trimmed}` : trimmed;
}

export function extrasProblems(extras: ProfileExtras): Partial<Record<keyof ProfileExtras, string>> {
  const problems: Partial<Record<keyof ProfileExtras, string>> = {};
  if (extras.headline.length > LIMITS.headline) problems.headline = `Keep it under ${LIMITS.headline} characters.`;
  if (extras.location.length > LIMITS.location) problems.location = `Keep it under ${LIMITS.location} characters.`;
  const github = extras.github.trim().replace(/^@/, "");
  if (github && !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(github)) {
    problems.github = "Use just your GitHub username, without the address.";
  }
  const linkedin = withScheme(extras.linkedin);
  if (linkedin && !/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]{2,100}\/?$/.test(linkedin)) {
    problems.linkedin = "Paste the full address of your LinkedIn profile, the one with /in/ in it.";
  }
  const website = withScheme(extras.website);
  if (website) {
    try {
      const url = new URL(website);
      if (url.protocol !== "https:") problems.website = "Use a secure address, one that starts with https.";
    } catch {
      problems.website = "Use the full address, starting with https.";
    }
  }
  return problems;
}
