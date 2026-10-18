import type { LevelId } from "./types";

export interface DrillItem {
  id: string;
  text: string;
  section: string;
}

export interface DesignDrill {
  chapter: string;
  level: LevelId;
  title: string;
  prompt: string;
  checklist: DrillItem[];
  mistakes: DrillItem[];
}
