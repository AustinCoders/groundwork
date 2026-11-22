import type { Experience, Goal, TargetRole } from "@/lib/account/session";

export const GOALS: { value: Goal; label: string }[] = [
  { value: "learn", label: "Learn the foundations" },
  { value: "interview", label: "Prepare for interviews" },
  { value: "switch", label: "Switch jobs or roles" },
  { value: "upskill", label: "Level up at work" },
];

export const LEVELS: { value: Experience; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const ROLES: { value: TargetRole; label: string }[] = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full stack" },
  { value: "other", label: "Something else" },
];
