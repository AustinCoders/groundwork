import { chapterHref, chapterMetas, notesHref, topic } from "@/lib/content";
import { ARCH_PARTS } from "@/lib/architectureParts";
import type { GuideNav } from "@/lib/topicNav";

type Meta = ReturnType<typeof chapterMetas>[number];

function guide(id: string, groups: { title: string; keep: (c: Meta) => boolean }[]): GuideNav | null {
  const t = topic(id);
  const list = chapterMetas(id);
  if (!t || !list.length) return null;
  return {
    id,
    name: t.name,
    mark: t.mark,
    accent: t.accent,
    href: notesHref(id),
    total: list.length,
    groups: groups
      .map((g) => ({
        title: g.title,
        chapters: list
          .filter(g.keep)
          .map((c) => ({ id: c.id, num: c.num, title: c.short ?? c.title, href: chapterHref(id, c.id) })),
      }))
      .filter((g) => g.chapters.length),
  };
}

const isBar = (c: Meta) => c.num.startsWith("50L");

export function guidesNav(): GuideNav[] {
  return [
    guide("interview", [
      { title: "The rounds", keep: (c) => !isBar(c) },
      { title: "The ₹50L bar", keep: isBar },
    ]),
    guide(
      "architecture",
      ARCH_PARTS.map((p) => ({ title: p.title, keep: (c: Meta) => (c.levels?.[0] ?? "beginner") === p.level }))
    ),
  ].filter((g): g is GuideNav => g !== null);
}
