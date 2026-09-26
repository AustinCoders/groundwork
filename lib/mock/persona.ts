import type { Shift } from "@/lib/mock/adaptive";
import type { LoopConfig, StageId } from "@/lib/mock/types";

export interface Persona {
  name: string;
  role: string;
  initials: string;
  tone: "warm" | "sharp" | "calm";
}

const PEOPLE: Record<StageId, Persona> = {
  screening: { name: "Meera", role: "Talent partner", initials: "ME", tone: "warm" },
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

export function personaFor(stage: StageId, config: LoopConfig): Persona {
  if (config.style === "amazon" && stage === "behaviour")
    return { name: "Anita", role: "Bar Raiser", initials: "AN", tone: "sharp" };
  return PEOPLE[stage];
}

const SETUP: Record<StageId, string[]> = {
  screening: [
    "This is a quick one, about twenty minutes. I just want to understand where you are and what you are looking for.",
    "Nothing technical today. I am trying to get a feel for your background before we set up the rest.",
  ],
  phone: [
    "We have about forty-five minutes. I will ask a few things across the stack, and I care more about your reasoning than a perfect answer.",
    "Short answers are fine. If you are not sure, tell me how you would find out.",
  ],
  coding: [
    "Talk me through your thinking as you go. I am grading the approach as much as the code.",
    "Start with how you would solve it, even the slow way, before you type anything.",
  ],
  machine: [
    "Build it the way you would at work. Get something running first, then we can make it better.",
    "You have the full time. I will mostly stay quiet unless you ask me something.",
  ],
  javascript: [
    "I want to go a level below the framework today, into how the language actually behaves.",
    "Short examples help. If code is easier than words, say the code.",
  ],
  react: [
    "Let's talk about how React actually renders, and the calls you make in a real codebase.",
    "I am less interested in API names than in why things behave the way they do.",
  ],
  backend: [
    "I'll ask about the runtime, the database and what happens when things go wrong.",
    "Think about a real service you have worked on. That is usually the best place to answer from.",
  ],
  design: [
    "We'll design something together. Ask me anything you need before you start drawing.",
    "There is no single right answer. I want to hear the trade-offs you are making.",
  ],
  infra: [
    "I'd like to understand how your code actually reaches production and how you know it is healthy.",
    "Be specific about what you set up yourself and what you inherited.",
  ],
  resume: [
    "I've read your resume. I'm going to pick one project and go deep on it.",
    "I'll ask about the numbers on here, so tell me how you measured them.",
  ],
  behaviour: [
    "These are about real situations you have been in. A specific story works better than what you usually do.",
    "Take a second to pick the story before you start. That is completely fine.",
  ],
  hr: [
    "We are close to the end now. I'd like to talk about the offer and what matters to you.",
    "This is a conversation, not a test. Tell me what you are looking for.",
  ],
};

const GREETING: Record<Persona["tone"], string[]> = {
  warm: ["Thanks for making the time.", "Good to meet you.", "Glad we could get this in."],
  sharp: ["Let's get straight into it.", "We've got a lot to cover.", "Right, let's start."],
  calm: ["Hi, thanks for coming in.", "Good to see you.", "Hi, take a moment to settle in."],
};

export function opener(persona: Persona, stage: StageId, seed: number): string {
  const greet = GREETING[persona.tone];
  const setup = SETUP[stage];
  const n = Math.abs(seed);
  return `${greet[n % greet.length]} I'm ${persona.name}, ${persona.role.toLowerCase()} here. ${setup[n % setup.length]}`;
}

export function shiftRemark(shift: Shift, persona: Persona): string {
  if (shift === "harder")
    return persona.tone === "warm"
      ? "That was a strong answer. Let me ask you something harder."
      : "Good. Let me push you a bit harder.";
  return persona.tone === "sharp"
    ? "Let's step back to the fundamentals for a moment."
    : "Let's try something a little more fundamental.";
}
