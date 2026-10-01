import type { LevelId } from "@/content/types";
import type { TocItem } from "@/lib/headingToc";

export interface SeriesCard<Level extends string = LevelId> {
  id: string;
  num: string;
  title: string;
  short?: string;
  subtitle: string;
  levels: Level[];
  minutes: number;
}

export interface SeriesPart<Level extends string = LevelId> {
  level: Level;
  title: string;
  blurb?: string;
}

export type { TocItem };
