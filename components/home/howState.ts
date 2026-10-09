import { runVariant, type Report, type VariantId } from "@/lib/howDemo";

export interface Demo {
  open: number | null;
  seen: number[];
  variant: VariantId;
  report: Report | null;
  failed: boolean;
  fixed: boolean;
  answer: string | null;
  today: Date | null;
}

export type Action =
  | { type: "open"; line: number }
  | { type: "pick"; variant: VariantId }
  | { type: "run" }
  | { type: "answer"; option: string }
  | { type: "mark"; today: Date }
  | { type: "reset" };

export const START: Demo = {
  open: null,
  seen: [],
  variant: "shared",
  report: null,
  failed: false,
  fixed: false,
  answer: null,
  today: null,
};

export function demoReducer(state: Demo, action: Action): Demo {
  switch (action.type) {
    case "open":
      return {
        ...state,
        open: state.open === action.line ? null : action.line,
        seen: state.seen.includes(action.line) ? state.seen : [...state.seen, action.line],
      };
    case "pick":
      return action.variant === state.variant ? state : { ...state, variant: action.variant, report: null };
    case "run": {
      const report = runVariant(state.variant);
      return {
        ...state,
        report,
        failed: state.failed || !report.ok,
        fixed: state.fixed || (state.failed && report.ok),
      };
    }
    case "answer":
      return { ...state, answer: action.option };
    case "mark":
      return { ...state, today: action.today };
    case "reset":
      return START;
  }
}

const GOALS = [
  (demo: Demo) => demo.seen.length >= 2,
  (demo: Demo) => demo.fixed,
  (demo: Demo) => demo.answer !== null,
  (demo: Demo) => demo.today !== null,
];

export function achieved(demo: Demo): boolean[] {
  return GOALS.map((goal) => goal(demo));
}
