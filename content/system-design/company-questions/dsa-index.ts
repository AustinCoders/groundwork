import type { DsaQuestion } from "./dsa-types";
import { questions as batch1 } from "./dsa-batch1";
import { questions as batch2 } from "./dsa-batch2";
import { questions as batch3 } from "./dsa-batch3";
import { questions as batch4 } from "./dsa-batch4";
import { questions as batch5 } from "./dsa-batch5";
import { questions as batch6 } from "./dsa-batch6";
import { questions as batch7 } from "./dsa-batch7";
import { questions as batch8 } from "./dsa-batch8";
import { questions as batch9 } from "./dsa-batch9";
import { questions as batch10 } from "./dsa-batch10";
import { questions as batch11 } from "./dsa-batch11";

export const COMPANY_DSA: readonly DsaQuestion[] = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
  ...batch9,
  ...batch10,
  ...batch11,
];
