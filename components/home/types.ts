import type { TopicCategoryId } from "@/content/types";
import type { HomeRound } from "@/lib/homeRounds";
import type { SiteStats } from "@/lib/topicStats";

export interface ShelfCard {
  id: string;
  name: string;
  mark: string;
  accent: string;
  tagline: string;
  category: TopicCategoryId | null;
  href: string;
  chapters: number;
  exercises: number;
  minutes: number;
}

export interface HomeViewProps {
  stats: SiteStats;
  ready: ShelfCard[];
  soon: ShelfCard[];
  languages: { total: number; runnable: number; runs: string[] };
  interview: { rounds: number; questions: number };
  bookRounds: HomeRound[];
}
