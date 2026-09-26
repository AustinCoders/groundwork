import type { CompanyType, Intensity, Role, Seniority } from "@/lib/mock/types";

export const ROLES: [Role, string, string][] = [
  ["frontend", "Frontend", "React and the browser"],
  ["fullstack", "Full-stack", "both ends of the wire"],
  ["backend", "Backend", "Node, APIs and databases"],
];

export const LEVELS: [Seniority, string, string][] = [
  ["junior", "2–3 years", "junior, and freshers"],
  ["mid", "5–7 years", "mid-level, owns features"],
  ["senior", "10+ years", "senior, sets direction"],
];

export const COMPANIES: [CompanyType, string, string][] = [
  ["service", "Service", "large IT services, set process"],
  ["product", "Product startup", "seed to Series C, small teams"],
  ["saas", "Product & SaaS", "mid-size product companies"],
  ["agency", "Agency", "studios and client work"],
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
