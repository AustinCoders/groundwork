import type { CompanyQuestion } from "./types";
import { questions as batch1 } from "./batch1";
import { questions as batch2 } from "./batch2";
import { questions as batch3 } from "./batch3";
import { questions as batch4 } from "./batch4";
import { questions as batch5 } from "./batch5";
import { questions as batch6 } from "./batch6";

export const COMPANY_QUESTIONS: readonly CompanyQuestion[] = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
];
