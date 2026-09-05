/** One labelled code sample inside a question's answer. */
export interface InterviewCodeBlock {
  label?: string;
  code: string;
}

export interface InterviewQuestionRaw {
  q: string;
  test?: string;
  a?: string;
  say?: string;
  trap?: string;
  note?: string;
  after?: string;
  fu?: string[];
  code?: InterviewCodeBlock | InterviewCodeBlock[];
}

export interface InterviewRoundRaw {
  id: string;
  code: string;
  navTitle: string;
  title: string;
  meta?: [string, string][];
  tiers?: [string, number][];
  intro?: string;
  pre?: string;
  post?: string;
  qs: InterviewQuestionRaw[];
  /** 2 marks the ₹50L+ staff track; absent (or 1) is the core loop. */
  lv?: number;
}
