import type { PatternId, SkillId, StyleId } from "@/lib/quiz";
import type { LevelId } from "./types";

export interface Choice {
  id: string;
  text: string;
  why: string;
}

export interface OrderItem {
  id: string;
  text: string;
}

interface QuestionBase {
  id: string;
  chapter: string;
  level: LevelId;
  skill: SkillId;
  pattern: PatternId;
  section: string;
  prompt: string;
  placement?: true;
}

export interface SingleQuestion extends QuestionBase {
  kind: "single";
  choices: Choice[];
  answer: string;
}

export interface MultiQuestion extends QuestionBase {
  kind: "multi";
  choices: Choice[];
  answers: string[];
}

export interface OrderQuestion extends QuestionBase {
  kind: "order";
  items: OrderItem[];
  why: string;
}

export interface PredictQuestion extends QuestionBase {
  kind: "predict";
  tracer: string;
  step: number;
  choices: Choice[];
  answer: string;
}

export type Question = SingleQuestion | MultiQuestion | OrderQuestion | PredictQuestion;

export interface PatternRecord {
  pattern: PatternId;
  chapter: string;
  signals: string[];
  template: string;
  time: string;
  space: string;
  styles: StyleId[];
}

export interface ChapterPool {
  questions: Question[];
  pattern: PatternRecord;
}
