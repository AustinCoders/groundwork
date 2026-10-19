import type { DsaQuestion } from "./dsa-types";
import { questions as batch1 } from "./dsa-batch1";
import { questions as batch2 } from "./dsa-batch2";
import { questions as batch3 } from "./dsa-batch3";
import { questions as batch4 } from "./dsa-batch4";
import { questions as batch5 } from "./dsa-batch5";
import { questions as batch6 } from "./dsa-batch6";

export const COMPANY_DSA: readonly DsaQuestion[] = [...batch1, ...batch2, ...batch3, ...batch4, ...batch5, ...batch6];
