import { isPlainObject, progress, activity, solvedOn, store, dayKey } from "@/lib/storage";
import { dailyDone, DAILY_KEY, type CardDaily, type DailyPick } from "./daily";
import { PLAN_KEY, sanitizePlan } from "./planData";
import { cardChallenge, challengeState, type CardChallenge, type WeekInput } from "./weekly";

export interface CardExtras {
  goal: number;
  challenge: CardChallenge;
  daily: CardDaily | null;
}

export function weekInput(): WeekInput {
  const chapterTimes = Object.values(progress.all().chapters)
    .map((mark) => (mark === true ? 0 : mark.at))
    .filter((at) => at > 0);
  return { activity: activity.all(), chapterTimes, solvedOn: solvedOn() };
}

export function rememberDailyPick(day: string, pick: DailyPick | null): void {
  if (!pick) return;
  const saved = store.get<unknown>(DAILY_KEY, null);
  if (isPlainObject(saved) && saved.day === day && saved.id === pick.id) return;
  store.set(DAILY_KEY, { day, ...pick });
}

export function cardExtras(today: string = dayKey()): CardExtras {
  const plan = sanitizePlan(store.get<unknown>(PLAN_KEY, null));
  const saved = store.get<unknown>(DAILY_KEY, null);
  const pickId = isPlainObject(saved) && saved.day === today && typeof saved.id === "string" ? saved.id : null;
  const done = pickId ? dailyDone({ id: pickId, title: "", level: "beginner", href: "" }, solvedOn(), today) : false;
  return {
    goal: plan.goal,
    challenge: cardChallenge(challengeState(today, weekInput())),
    daily: pickId ? { day: today, done } : null,
  };
}
