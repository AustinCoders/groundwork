export interface CompletenessInput {
  name: string;
  emailName: string;
  hasPicture: boolean;
  headline: string;
  location: string;
  github: string;
  linkedin: string;
  website: string;
  role: string | null;
  goal: string | null;
  experience: string | null;
  planned: boolean;
  skills: number;
}

export interface CompletenessItem {
  id: string;
  label: string;
  done: boolean;
  href: string;
}

export interface Completeness {
  percent: number;
  done: number;
  total: number;
  items: CompletenessItem[];
}

const EDITOR = "/account/profile";

export function completeness(input: CompletenessInput): Completeness {
  const filled = (value: string) => value.trim().length > 0;
  const items: CompletenessItem[] = [
    {
      id: "name",
      label: "Your name",
      done: filled(input.name) && input.name.trim().toLowerCase() !== input.emailName.trim().toLowerCase(),
      href: `${EDITOR}#profile-basics`,
    },
    { id: "picture", label: "A photo or avatar", done: input.hasPicture, href: `${EDITOR}#profile-look` },
    { id: "headline", label: "A headline", done: filled(input.headline), href: `${EDITOR}#profile-basics` },
    { id: "location", label: "Where you are", done: filled(input.location), href: `${EDITOR}#profile-basics` },
    { id: "github", label: "Your GitHub", done: filled(input.github), href: `${EDITOR}#profile-links` },
    {
      id: "links",
      label: "LinkedIn or a website",
      done: filled(input.linkedin) || filled(input.website),
      href: `${EDITOR}#profile-links`,
    },
    { id: "role", label: "The role you want", done: input.role !== null, href: `${EDITOR}#profile-goals` },
    {
      id: "goal",
      label: "Your goal and level",
      done: input.goal !== null && input.experience !== null,
      href: `${EDITOR}#profile-goals`,
    },
    { id: "plan", label: "An interview date or companies", done: input.planned, href: "/account#account-plan" },
    { id: "skills", label: "Your skills, rated", done: input.skills > 0, href: "/account#account-plan" },
  ];
  const done = items.filter((item) => item.done).length;
  return { percent: Math.round((done / items.length) * 100), done, total: items.length, items };
}
