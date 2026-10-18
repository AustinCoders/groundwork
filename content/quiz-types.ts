import type { DesignSkillId } from "@/lib/designQuiz";
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

interface QuestionCore {
  id: string;
  chapter: string;
  level: LevelId;
  section: string;
  prompt: string;
}

interface DsaTags {
  skill: SkillId;
  pattern: PatternId;
  placement?: true;
}

interface DesignTags {
  skill: DesignSkillId;
}

interface SingleShape {
  kind: "single";
  choices: Choice[];
  answer: string;
}

interface MultiShape {
  kind: "multi";
  choices: Choice[];
  answers: string[];
}

interface OrderShape {
  kind: "order";
  items: OrderItem[];
  why: string;
}

export type SingleQuestion = QuestionCore & DsaTags & SingleShape;

export type MultiQuestion = QuestionCore & DsaTags & MultiShape;

export type OrderQuestion = QuestionCore & DsaTags & OrderShape;

export type PredictQuestion = QuestionCore &
  DsaTags & {
    kind: "predict";
    tracer: string;
    step: number;
    choices: Choice[];
    answer: string;
  };

export type Question = SingleQuestion | MultiQuestion | OrderQuestion | PredictQuestion;

export type DesignQuestion = QuestionCore & DesignTags & (SingleShape | MultiShape | OrderShape);

export type CheckQuestion = Question | DesignQuestion;

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

export interface DesignPool {
  questions: DesignQuestion[];
}
