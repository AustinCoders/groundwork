import type { Shift } from "@/lib/mock/adaptive";
import type { LoopConfig, StageId } from "@/lib/mock/types";

export interface Persona {
  name: string;
  role: string;
  initials: string;
  tone: "warm" | "sharp" | "calm";
}

const PEOPLE: Record<StageId, Persona> = {
  screening: { name: "Meera", role: "Talent partner", initials: "MI", tone: "warm" },
  phone: { name: "Karan", role: "Senior engineer", initials: "KS", tone: "sharp" },
  coding: { name: "Arjun", role: "Senior engineer", initials: "AR", tone: "sharp" },
  machine: { name: "Sana", role: "Frontend lead", initials: "SA", tone: "calm" },
  javascript: { name: "Dev", role: "Staff engineer", initials: "DV", tone: "sharp" },
  react: { name: "Ira", role: "Frontend lead", initials: "IR", tone: "calm" },
  backend: { name: "Vikram", role: "Backend lead", initials: "VK", tone: "sharp" },
  design: { name: "Priya", role: "Principal engineer", initials: "PR", tone: "calm" },
  infra: { name: "Tom", role: "Platform engineer", initials: "TM", tone: "calm" },
  resume: { name: "Rohan", role: "Engineering manager", initials: "RO", tone: "warm" },
  behaviour: { name: "Rahul", role: "Engineering manager", initials: "RA", tone: "warm" },
  hr: { name: "Neha", role: "HR business partner", initials: "NE", tone: "warm" },
};

export function personaFor(stage: StageId, config: LoopConfig, who?: string): Persona {
  if (config.style === "amazon" && stage === "behaviour")
    return { name: "Anita", role: "Bar Raiser", initials: "AN", tone: "sharp" };
  const person = PEOPLE[stage];
  const role = who?.split(/[,;(]/)[0].trim();
  return role && role.length <= 40 ? { ...person, role: role[0].toUpperCase() + role.slice(1) } : person;
}

const OPENERS: Record<Persona["tone"], string[]> = {
  warm: ["Thanks for making the time.", "Good to meet you.", "Glad we could get this in."],
  sharp: ["Let's get straight into it.", "We've got a lot to cover, so let's start.", "I'll keep this moving."],
  calm: [
    "Take your time with these.",
    "Think out loud — I care about how you get there.",
    "No rush; talk me through it.",
  ],
};

export function opener(persona: Persona, seed: number): string {
  const lines = OPENERS[persona.tone];
  return `${lines[Math.abs(seed) % lines.length]} I'm ${persona.name} — ${persona.role}.`;
}

export function shiftRemark(shift: Shift, persona: Persona): string {
  if (shift === "harder")
    return persona.tone === "warm"
      ? "That was a strong answer — let me ask you something harder."
      : "Good. Let me push you harder.";
  return persona.tone === "sharp"
    ? "Let's step back to the fundamentals for a moment."
    : "Let's try something a little more fundamental.";
}
