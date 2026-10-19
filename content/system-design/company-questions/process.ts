import type { CompanyProcess, ReportedPrompt } from "./process-types";
import { PROCESS_MAIN } from "./process-main";
import { PROCESS_STARTUPS } from "./process-startups";
import { PROCESS_STARTUPS_REPORTED } from "./process-startups-reported";

export const PROCESSES: readonly CompanyProcess[] = [...PROCESS_MAIN, ...PROCESS_STARTUPS];

export const REPORTED: readonly ReportedPrompt[] = PROCESS_STARTUPS_REPORTED;

export const processOf = (company: string) => PROCESSES.find((entry) => entry.company === company);
