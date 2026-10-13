import { COMPANIES, INTENSITIES, LEVELS, ROLES } from "@/app/mock/options";
import { STYLES } from "@/lib/mock/styles";
import type { CompanyType, Intensity, LoopConfig, Role, Seniority } from "@/lib/mock/types";

export function sanitizeConfig(stored: unknown, fallback: LoopConfig): LoopConfig {
  const saved: Record<string, unknown> =
    stored !== null && typeof stored === "object" && !Array.isArray(stored) ? (stored as Record<string, unknown>) : {};
  return {
    role: ROLES.some(([r]) => r === saved.role) ? (saved.role as Role) : fallback.role,
    seniority: LEVELS.some(([l]) => l === saved.seniority) ? (saved.seniority as Seniority) : fallback.seniority,
    company: COMPANIES.some(([c]) => c === saved.company) ? (saved.company as CompanyType) : fallback.company,
    intensity: INTENSITIES.some(([i]) => i === saved.intensity) ? (saved.intensity as Intensity) : fallback.intensity,
    style:
      typeof saved.style === "string" && Object.hasOwn(STYLES, saved.style)
        ? (saved.style as LoopConfig["style"])
        : null,
  };
}
