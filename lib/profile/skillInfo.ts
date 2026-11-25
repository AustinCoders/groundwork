import { SKILLS } from "@/lib/resume/skills";
import { topicHome } from "@/lib/topics";

export function skillInfo(): Record<string, { name: string; href: string | null }> {
  const out: Record<string, { name: string; href: string | null }> = {};
  for (const skill of SKILLS) {
    out[skill.id] = { name: skill.name, href: skill.topic ? topicHome(skill.topic) : null };
  }
  return out;
}
