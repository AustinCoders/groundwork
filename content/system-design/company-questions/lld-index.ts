import type { LldQuestion } from "./lld-types";
import { questions as batch1 } from "./lld-batch1";
import { questions as batch2 } from "./lld-batch2";
import { questions as batch3 } from "./lld-batch3";
import { questions as batch4 } from "./lld-batch4";
import { questions as batch5 } from "./lld-batch5";

export const COMPANY_LLD: readonly LldQuestion[] = [...batch1, ...batch2, ...batch3, ...batch4, ...batch5];
