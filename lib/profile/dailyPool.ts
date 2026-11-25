import { exercises } from "@/lib/content";
import { problemHref } from "@/lib/problemHref";
import type { DailyPick } from "./daily";

export function dailyPool(): DailyPick[] {
  return exercises()
    .filter((ex) => ex.kind !== "component" && ex.tests.length > 0)
    .map((ex) => ({ id: ex.id, title: ex.title, level: ex.level, href: problemHref(ex.id) }));
}
