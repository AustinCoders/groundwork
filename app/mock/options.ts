import type { CompanyType, Intensity, Role, Seniority } from "@/lib/mock/types";

export const ROLES: [Role, string, string][] = [
  ["frontend", "Frontend", "React, the browser"],
  ["fullstack", "Full-stack", "both ends"],
  ["backend", "Backend", "Node, databases"],
];

export const LEVELS: [Seniority, string, string][] = [
  ["junior", "2–3 years", "junior"],
  ["mid", "5–7 years", "mid-level"],
  ["senior", "10+ years", "senior"],
];

export const COMPANIES: [CompanyType, string, string][] = [
  ["service", "Service", "consulting, TCS tier"],
  ["product", "Product startup", "Series A–C"],
  ["saas", "Product & SaaS", "Freshworks tier"],
  ["agency", "Agency", "studios, client work"],
];

export const INTENSITIES: [Intensity, string][] = [
  ["quick", "Quick"],
  ["standard", "Standard"],
  ["full", "Full"],
];

export function hours(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
